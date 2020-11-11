$(async function() {
  // cache some selectors we'll be using quite a bit
  const $allStoriesList = $("#all-articles-list");
  const $filteredArticles = $("#filtered-articles");
  const $loginForm = $("#login-form");
  const $createAccountForm = $("#create-account-form");
  const $ownStories = $("#my-articles");
  const $navLogin = $("#nav-login");
  const $navLogOut = $("#nav-logout");
  const $navPost = $("#nav-post")
  const $submitForm = $("#submit-form");
  const $navFav = $("#nav-fav")
  const $favoriteArticles = $("#favorited-articles");
  const $articleForm = $("#articles-container")
  const $navProfile = $("#nav-profile")
  const $userProfile = $("#user-profile")
  const $navMyStories = $("#nav-myStories")
  const $myStories = $("#my-articles")


  // global storyList variable
  let storyList = null;

  // global currentUser variable
  let currentUser = null;

  let publishedStory = null;
  await checkIfLoggedIn();

  
  /**
   * Event listener for logging in.
   *  If successfully we will setup the user instance
   */

   function loginFormSubmit(){
    evt.preventDefault(); // no page-refresh on submit
   
    // grab the username and password
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    // call the login static method to build a user instance
    const userInstance = await User.login(username, password);
    // set the global user to the user instance
    currentUser = userInstance;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
    await generateStories();
    click()
   }

   ////avoid using anonymous functions, this way you could have named functions and organize the code like this

  $loginForm.on("submit", loginFormSubmit);

  $createAccountForm.on("submit", createAccountForm);

  $navPost.on("submit", loginFormSubmit);


  /**
   * Event listener for signing up.
   *  If successfully we will setup a new user instance
   */
  $createAccountForm.on("submit", async function(evt) {
    evt.preventDefault(); // no page refresh
    
    // grab the required fields
    let name = $("#create-account-name").val();
    let username = $("#create-account-username").val();
    let password = $("#create-account-password").val();

    // call the create method, which calls the API and then builds a new user instance
    const newUser = await User.create(username, password, name);
    currentUser = newUser;
    syncCurrentUserToLocalStorage();
    loginAndSubmitForm();
  });

  $navPost.on("click", function (e) {
    $submitForm.slideToggle();
    $favoriteArticles.hide();    
    $myStories.hide()
  })

    //Post a story
  $submitForm.on("submit", async function (e) {
    e.preventDefault()
    
    const author = $("#author").val()
    const title = $("#title").val()
    const url = $("#url").val()

    $("#url").val('')
    $("#author").val('')
    $("#title").val('')

    let token = currentUser.loginToken;
    
    let newStory = new StoryList({ author, title, url})
    
    let postStory = await newStory.addStory(token, { author, title, url });
 
    ////instead of reload, you could manually regenerate the stories
    location.reload();
    return postStory;
  })

  //append own stories to #myStories
  function ownStories() {
    for (let myStory of currentUser.ownStories) {
      const ownStory = generateStoryHTML(myStory, true, true) 

      $myStories.append(ownStory)
    }
  }
  
  ////reuse generateStoryHtml
  function generateMyStoryHTML(story) {
    let hostName = getHostName(story.url);

    // render story markup
    const storyMarkup = $(`
      <li id="${story.storyId}">
        <i class="fas fa-trash"></i>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong> ${story.title}</strong>
        </a>
        
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);

    return storyMarkup;
  }
  
  
  //generate favStories
  async function generateFavStories() {
    $('#favorited-articles li').remove()
          
    ////reuse base_url variable
    ////call functions related to API communication on api-classes file
    
    currentUser.favorites = await User.getLoggedInUser(currentUser.loginToken, currentUser.username);
    //get story info from user favorites and append to favorites seciton
    
    for (let favStory of currentUser.favorites) {
      const indivFav = favStoryHTML(favStory)
      $favoriteArticles.append(indivFav)
    }
    
  }

  //function to render favorite stories 
  function favStoryHTML(favStory) {
 
    let hostName = getHostName(favStory.url);

    // render story markup
    const favStoryMarkup = $(`
      <li id="${favStory.storyId}">
        <span class="star"><i class="fas fa-star"></i></span>
        <a class="article-link" href="${favStory.url}" target="a_blank">
          <strong> ${favStory.title}</strong>
        </a>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong> ${story.author}</strong>
        </a>
        <small class="article-author">by ${favStory.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${favStory.username}</small>
      </li>
    `);

    return favStoryMarkup;
    
  }
  
  //place click events in function to continue flow of code
  function click() {
    let username = null;
    let userToken = null;
    
    if (currentUser) {
         username = currentUser.username
         userToken = currentUser.loginToken
    } else {
      return;
    }


    //favorite a story, send to api
    $(".star").on("click", ".far", async function (e) {
      //make star solid upon clicking
      e.target.className = "fas fa-star";

      //save userToken,username, and storyId for API
      const storyId = e.target.parentElement.parentElement.id;
      
      //add create a add Favorite story

      await currentUser.addFavorite(storyId);
      //generate favorite stories 
      await generateFavStories()   
      
    })
    
  //remove favorite from user api when unfavorited
    $(".star").on("click", ".fas", async function (e) {
      //make star reg upon clicking
      e.target.className = "far fa-star";

      //get storyId to delete from API
      const storyId = e.target.parentElement.parentElement.id;

      //delete story from user API 
      const del = await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/users/${username}/favorites/${storyId}`, { data: { "token": userToken } })

      //update favorite article   
      await generateFavStories()  
      click()

    })

    //remove own article when trash can is clicked
    $(".fa-trash").on("click", async function (e) {

      const targetLI = e.target.parentElement;
      //remove the article associated with the trashcan icon that was clicked
      $('#my-articles').find(targetLI).remove()

      //delete story from userfav in the API
      const storyId = e.target.parentElement.id

      let del = await axios.delete(`https://hack-or-snooze-v3.herokuapp.com/stories/${storyId}`, { data: { "token": userToken } })

    })

  }

  /*Log Out Functionality*/
  $navLogOut.on("click", function() {
    // empty out local storage
    localStorage.clear();
    // refresh the page, clearing memory
    location.reload();
  });


  /*Event Handler for Clicking Login*/
    $navLogin.on("click", function() {
    // Show the Login and Create Account Forms
    $loginForm.slideToggle();
    $createAccountForm.slideToggle();
    $allStoriesList.toggle();
  });

  /*on click of fav articles, show article*/
  $navFav.on("click", async function () {
    $favoriteArticles.show();
    $allStoriesList.hide();
    $userProfile.hide();
    $submitForm.hide();
    $myStories.hide()
    await generateFavStories()   
    click()
  })

  /* Event handler for Navigation to Homepage*/

  $("body").on("click", "#nav-all", async function() {
    await generateStories();
    hideElements();
    $allStoriesList.show();
    $articleForm.hide();
    $submitForm.hide();
    $userProfile.hide();
    $myStories.hide()
    $favoriteArticles.hide();
    location.reload()
    click()
    
  });

  //Profile from navigation
  $navProfile.on("click", function() {
    $userProfile.show();
    $submitForm.hide();
    $allStoriesList.hide();
    $submitForm.hide();
    $favoriteArticles.hide();
    $myStories.hide()
    userProfileInfo()
  })

  //Show articles published by own user
  $navMyStories.on("click", function () {
    $myStories.show()
    $userProfile.hide();
    $submitForm.hide();
    $allStoriesList.hide();
    $submitForm.hide();
    $favoriteArticles.hide();
    click()
  
  })

  //update user profile with info
  function userProfileInfo() {

    const username = currentUser.username;
    $('#profile-username').append(username)

    const name = currentUser.name;
    $('#profile-name').append(name)

    const creationDay = new Date(currentUser.createdAt).toString()

    creationDay.getDay()
    creationDay.getMonth()
    creationDay.getYear();

    ////the creationDay you have functions like getMonth(), getDay()
    const mm = creationDay.slice(4, 7)
    const dd = creationDay.slice(8,10)
    const yyyy = creationDay.slice(11, 15)
    
    $('#profile-account-date').append(`${mm} ${dd}, ${yyyy}`)

  }

  /**
   * On page load, checks local storage to see if the user is already logged in.
   * Renders page information accordingly.
   */
  async function checkIfLoggedIn() {
 
    // let's see if we're logged in
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    
    
    // if there is a token in localStorage, call User.getLoggedInUser
    //  to get an instance of User with the right details
    //  this is designed to run once, on page load
    currentUser = await User.getLoggedInUser(token, username);
    await generateStories();
    
    
    if (currentUser) {
      showNavForLoggedInUser();
      await generateFavStories();
      
    }
}

  /**
   * A rendering function to run to reset the forms and hide the login info
   */

  function loginAndSubmitForm() {
    // hide the forms for logging in and signing up
    $loginForm.hide();
    $createAccountForm.hide();

    // reset those forms
    $loginForm.trigger("reset");
    $createAccountForm.trigger("reset");

    // show the stories
    $allStoriesList.show();

    // update the navigation bar
    showNavForLoggedInUser();
  }

  /**
   * A rendering function to call the StoryList.getStories static method,
   *  which will generate a storyListInstance. Then render it.
   */

  async function generateStories() {

    // get an instance of StoryList
    const storyListInstance = await StoryList.getStories();
    // update our global variable
    storyList = storyListInstance;
    // empty out that part of the page
    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
      // console.log(story)
      const result = generateStoryHTML(story);
      $allStoriesList.append(result);
    }
  }

  /**
   * A function to render HTML for an individual Story instance
   */


   generateStoryHTML({}, true, false);

   ////centralize on this function
  function generateStoryHTML(story, isFavorite, isOwnStory) {
    
    let star = "far"
    if (currentUser) {
      star = solidStars(story) ? "fas" : "far"

    }
    
    let trashCanIcon = isOwnStory ? '<i class="fas fa-trash"></i>' : '';

    let hostName = getHostName(story.url);

    // render story markup
    const storyMarkup = $(`
      <li id="${story.storyId}">
        ${trashCanIcon}
        <span class="star"><i class="${star} fa-star"></i></span>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong> ${story.title}</strong>
        </a>
        <a class="article-link" href="${story.url}" target="a_blank">
          <strong> ${story.author}</strong>
        </a>
        <small class="article-author">by ${story.author}</small>
        <small class="article-hostname ${hostName}">(${hostName})</small>
        <small class="article-username">posted by ${story.username}</small>
      </li>
    `);

    return storyMarkup;
  }
  
    function solidStars(story) {
      
    let favStoryId = new Set()
    for (let myStory of currentUser.favorites) {
      favStoryId.add(myStory.storyId)
    }
    return favStoryId.has(story.storyId)
  }

  /* hide all elements in elementsArr */

  function hideElements() {
    const elementsArr = [
      $submitForm,
      $allStoriesList,
      $filteredArticles,
      $ownStories,
      $loginForm,
      $createAccountForm
    ];
    elementsArr.forEach($elem => $elem.hide());
  }

  function showNavForLoggedInUser() {
    $navLogin.hide();
    $navLogOut.show();
    $navPost.show();
    $navFav.show();
    $articleForm.show();
    $navProfile.show();
    $userProfile.hide();
    $navMyStories.show();
    ownStories()
    click()
  }

  /* simple function to pull the hostname from a URL */

  function getHostName(url) {
    let hostName;
    if (url.indexOf("://") > -1) {
      hostName = url.split("/")[2];
    } else {
      hostName = url.split("/")[0];
    }
    if (hostName.slice(0, 4) === "www.") {
      hostName = hostName.slice(4);
    }
    return hostName;
  }

  /* sync current user information to localStorage */

  function syncCurrentUserToLocalStorage() {
    if (currentUser) {
      localStorage.setItem("token", currentUser.loginToken);
      localStorage.setItem("username", currentUser.username);
    }
  }
  
  click()
});
