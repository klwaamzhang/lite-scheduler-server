# Lite Scheduler Server Side
 
 >Please go to [this link](https://github.com/klwaamzhang/lite-scheduler-client) if you want to check out __the client side code__ and [this link](https://klwaamzhang.github.io/lite-scheduler-client/) if you want to see __the project__.
 
 ## Introduction
 Lite Scheduler is a react web app which is a lite version of scheduler for multiple types of users to schedule tasks. 

 ## Functionality
 In this app, you could:
* Add and manage your schedule without login (Your data will be stored in your browser)
* Login as regular, student or senior user, enjoy the different scheduler layouts and functions
* Login to save your schedule permanently, no need to worry losing schedules
* Update your info or switch your account to any type of the user layout to fit what you need
* <del>Send Email to you before an important event is coming</del> (still in development)

## Web back end end techniques
 In this app, we use:
 * NodeJS and ExpressJS for APIs request and response
 * RESTful API and Mongo query to request and retrieve data
 * <del>Nodemailer and Node-schedule for sending email functionality</del> (It needs to be improved since Gmail security reason)
 * MongoDB Atlas as the database to store data on cloud
 
