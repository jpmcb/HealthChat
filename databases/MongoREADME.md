# Mongo README
_____

User collection:
* The passwords appear in the database as encrypted hashes 

`{firstname: "Foo", lastname: "Bar", username: "foobar", password: "helloworld", type: "nurse"}`

Rooms collections - each room represents a seperate chat and is implemented in the database as a seperate collection
* The message field is encrypted in the database

`{sender: "testUser", timestamp: "15141234984", message: "Patient needs pain meds"}`