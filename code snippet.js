
  
  /////////start here
//if user favorites has a similar id change star class to solid
  function solidStars(story) {
 
    let favStoryId = new Set()
    for (let myStory of currentUser.favorites) {
      favStoryId.add(myStory.storyId)
    }

    return favStoryId.has(story.storyId)
  }


function generateStoryHTML(story) {
    if (currentUser) {
        let star = solidStars(story) ? "fas" : "far"
        console.log(star)
    }
    ...
}


function solidStars(story) {
    let favStoryId = new Set()
    let res = await axios.get(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/?token=${currentUser.loginToken}`)

    let { favorites } = res.data.user

    for (let favs of favorites) {
        console.log(favs.storyId)
        favStoryId.add(favs.storyId)
    }
    console.log(favStoryId.has(story.storyId))
    return favStoryId.has(story.storyId)
}