# XpertRule Decision Factory Multi-KB Launcher
Sample template for provisioning multiple Knowledge Bases (from either Decision Author or Decision Factory) via PhoneGap

Back end integration (e.g. user login validation) is left up to you (i.e. there is no back end in this repository) but there are stub functions (see "Back end operations" section) for you to implement this functionality.  
User login information is help persistantly (via HTML 5 localStorage) to implement conventional mobile app functionality (this can be disabled if per-invokation login is required)

# Customization

## Changing the logo
The main logo is stored here... 

/launcher/images/logo.png

Aim for about 300 x 300 pixels

The favicon (mainly used for desktop browser) is also in the /launcher/images folder

## Including knowledge bases

Within Desicion Author or Decision Factory, use the **Deploy Knowledge Base | Web Pages** menu option.  
Take the resulting .zip file and un-compress into a folder withing the /apps folder

## Maintaing the list of knowledge bases

In the launcher/index.html file, look for the section marked...
```
/* --------- touch points be here --------- */
```

From there look bwlow for the **doPopulateKBs** function. This function populates the list of knowledge bases within the framework. This list is then used to populate the KB list from within the app.

Each item in the list (array) is an object with the following properties...
```
{
    folder: "my_kb_folder",
    name: "Super KB 1",
    description: "Description of the knowledge base",
    image: "xrkb/assets/logo.png",
    access: [""]
}
```

| property | description |
|----------|-------------|
| folder | The name of the folder within the /apps folder which holds the knowledge base |
| name | The name of the knowledge base (to display on the tile) |
| description | The description of the knowledge base (not currently used) |
| image | The path of the image _within the KB's folder_ for the file. In the above example, the tile image lives in **/apps/my_kb_folder/xrkb/assets/logo.png** |
| access | The access permissions of the knowledge base. The empty string referes to anonymous access, and in the default template, "user" refers to any logged in user. The user's access level is returned via the login process. n.b. If the access property is missing from the kb definition, it is assumed to be anonymous access |

## Back end operations

This published framework has no back end integration. Stubs can be found in the launcher/index.html file, look for the section marked...
```
/* --------- touch points be here --------- */
```

There are 4 back end touch points (along with the **doPopulateKBs** function described previously)

### function doLogin(email, password, successCB, failCB)  
Send the entered credentials (email and password) to your authentication server. If successful, call the supplied **successCB** function with a user object. e.g.
```
successCB({
    email: email,
    access: "user"
});
```
Is the login fails, call the supplied **failCB** function with a simple error message string. e.g.
```
failCB("Woops, your credentials are not working");
```

n.b. The stub function basicalls says that anything supplied in the email field = valus user, otherwise fail

### function doLogout(successCB, failCB)
Logout the current user. If required, the current user's object can be retrieved via **mkb.userInfo()**

### function doResetPwd(email, successCB, failCB)
Instigate a password reset workflow for the email access supplied. 

### function doSignup(email, password, successCB, failCB)
Instigate an account creation workflow for the email & password supplied.

## Additional Customization

The "Terms & Conditions" small print is hard-coded into launcher/index.html Just search for id="conditions_container" to dind the relevant DIV

---
_&copy; XpertRule Software Ltd 2018_
