const program = require('commander');
const inquirer = require('inquirer');
const prompt = inquirer.createPromptModule();
const piazza = require('piazza-api');
const blessed = require('blessed');
const chalk = require('chalk');
const figlet = require('figlet');

var questions = [
	{
		type: 'input',
		name: 'username',
		message: 'Enter email address: ',
		validate: function(value) {
			if (value.length) {
				return true;
			} else {
				return "This field cannot be left blank";
			}
		}
	},
	{
		type: 'password',
		name: 'password',
		message: 'Enter password: ',
		validate: function(value) {
			if (value.length) {
				return true;
			} else {
				return "This field cannot be left blank ";
			}
		}
	}
];

var options = [
	{
		type: 'list',
		name: 'nextStep',
		message: 'What would you like to do next?',
		choices: [
			'View classes',
			'Exit'
		]
	}
];

var addPost = [
	{
		type: 'input',
		name: 'title',
		message: 'Enter a title for your post: ',
		validate: function(value) {
			if (value.length) {
				return true;
			} else {
				return "This field cannot be left blank";
			}
		}
	},
	{
		type: 'input',
		name: 'body',
		message: 'Enter the details for your post: ',
		validate: function(value) {
			if (value.length) {
				return true;
			} else {
				return "This field cannot be left blank";
			}
		}
	}
];

const startUp = () => {
	console.clear();
	console.log(
		chalk.blue(
			figlet.textSync('piazza cli', { horizontalLayout: 'full' })
		)
	);
};

const authenticate = (credentials) => {

	piazza.login(credentials.username, credentials.password)
	.then(function(user) {

		startUp();
		console.info("\nWelcome", user.name);

		inquirer.prompt(options).then(function(answers) {
			displayOptions(answers, user);
		});

	})
	.catch((err) => {
		console.info("An error occurred, please try again.");
	})
};

var array = [];
var objects =[];

function displayOptions(answers, user) {

	if (answers.nextStep == 'View classes') {

		startUp();
		for (var i = 0; i < user.classes.length; i++) {
			if (user.classes[i].status == "active") {
				console.info(user.classes[i], " - ", user.classes[i].term);
				array.push(user.classes[i]);
				objects.push(user.classes[i].name);

			}
		}

		var options2 = [
			{
				type: 'list',
				name: 'selectClasses',
				message: 'Select a class',
				choices: array
			}
		];

		startUp();
		var selection;
		inquirer.prompt(options2).then(function(answers) {
	
			console.info('Specific class chosen');
			console.info(answers.selectClasses);
			var index; 
			for (var i = 0; i < objects.length; i++) {
				if (objects[i] == answers.selectClasses) {
					index = i; 
					break;
				}
			}

			displayClassOptions(answers.selectClass, user, index);
		});
	}
}

function displayClassOptions(answers, user, selection) {
	var options3 = [
		{
			type: 'list',
			name: 'selectClassOptions',
			message: 'What would you like to do next?',
			choices: [
				'View recent (unread) posts',
				'Create a new post',
				'Search for relevant posts'
			]
		}
	];

	console.info(answers);

	inquirer.prompt(options3).then(function(classAnswers) {
		if (classAnswers.selectClassOptions == 'View recent (unread) posts') {
			
			console.info('Display recent posts');
			console.info(array[selection].filterByProperty('Unread').then(function(data){
			
				for (var i = 0; i < data.length; i++) {
					console.info(strip_html_tags(data[i].title));
				}
			}));

		} else if (classAnswers.selectClassOptions == 'Create a new post') {
			console.info('Make new post');

			var classID = array[selection].id;
			inquirer.prompt(addPost).then(function(answers) {
				user.postQuestion(classID, answers.title, answers.body, { "anonymous": "full" });
			});
		}
	});
}

function strip_html_tags(str)
{
   if ((str === null) || (str === ''))
       return false;
  else
   str = str.toString();
   str = str.replace(/[0-9]/g, '');
   str = str.replace(/&#;/g, '');
  return str.replace(/<[^>]*>/g, '');
}

program
	.version('0.0.1')
	.description('piazza command line utility');

program
	.command('login')
	.alias('l')
	.description('Login to Piazza')
	.action(() => {
		startUp(),
		prompt(questions).then((answers) => authenticate(answers));
	});


program.parse(process.argv);