•	When user logs in: token is sent back to mark that a user is logged in
•	

// signing up & get token
create form and save data (name, password, username)
**use Signup endpoint**
*gives back token

//create userlogin
userlogin()(username and password)
**Use Login endpoint**
* gives back token


//create story from userlogin
createNewStory() (token, username, title, author, url)
**Create a New Sotyr endpoint**
add new form
when submitted, send data in form of API: StoryList class

responds with newly created story
append story to DOM
make sure only logged in users can create new story


//allow users to fav/unfav a favorite story
**Add a new favorite endpoint** (token, storyId)
stories should remain favorited when page refreshes
**Delete a user favorite** (token, storyId)
loggedin users can see a separate list of favorite stories:define in User class

//removing stories
**Delete a story endpoint**(token, storyId)
remove a story if user is logged in
remove from DOM + refresh page to delete story
