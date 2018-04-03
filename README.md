# XpertRule Decision Factory Multi-KB Launcher
Sample template for provisioning multiple Knowledge Bases (from either Decision Author or Decision Factory) via PhoneGap

# Customization

## Changing the Logo
The main logo is stored here... 

/launcher/images/logo.png

Aim for about 300 x 300 pixels

The favicon (mainly used for desktop browser) is also in the /launcher/images folder

## Including Knowledge Bases

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
| image | The path of the image _within the KB's folder_ for the file |
| access | The access permissions of the knowledge base. The empty string referes to anonymous access, and (in the supplied example), "user" refers to a logged in user. The user's access level is returen via the login process

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

### function doLogout(successCB, failCB)
Logout the current user. If required, the current user's object can be retrieved via **mkb.userInfo()**

### function doResetPwd(email, successCB, failCB)
Instigate a password reset workflow for the email access supplied. 

### function doSignup(email, password, successCB, failCB)
Instigate an account creation workflow for the email & password supplied.

## Additional Customization

The "Terms & Conditions" small print is hard-coded into launcher/index.html Just search for id="conditions_container" to dind the relevant DIV

---
Copyright XpertRule Software Ltd 2018
