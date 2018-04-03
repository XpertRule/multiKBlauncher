# XpertRule NLP API

## Overview

The recomended way to integrate with the XpertRule NLP engine is via the "chat.js" javascript file.

This file exposes the "xrkb_chat" function which is used to communicate with the server

Examples in this document are based on the following publicly available demonstration...

[https://rpa.xpertrule.com:8134/FS%20Demo%20Sep%2017/main.html](https://rpa.xpertrule.com:8134/FS%20Demo%20Sep%2017/main.html)


## Anatomy of a conversation (Step 1 - Start Inference)

Call chat with an empty message...

```javascript
xrkb_chat({}, chatCallbackFunction);
```

*n.b. By default xrkb_chat calls the chat server based on the URL of "chat.js".
If the front end files are served from a location different to the chat server, you can pass an optional "url" parameter in each input message to specify the engine's location.
e.g. xrkb_chat({url: "https://rpa.xpertrule.com:8134/FS%20Demo%20Sep%2017"}, chatCallbackFunction);*

The engine will respond by calling the function specified in the second parameter (in this case **chatCallbackFunction**) and passing a result object as the first parameter to this function. e.g.

```javascript
function chatCallbackFunction(result) {
    // deal with the result object here
}
```

The result object passed to the callback function might look something like this...

```javascript
{
    ok: true,
    mode: "pause",
    output : {/* object passed from knolwedge builder */},
    speak: "Welcome to our Financial Services Demo",
    vocabulary: [/* array of string to help the speech to text recogniser */],
    session: {/* internal session object to pass in the next call */}
}
```

| Property | Type | Description |
| -------- | ----- | ----------- |
| ok       | boolean  | Has the API call been succesful |
| mode     | string | Why has inference stopped (i.e. what action should the front end perform). Possible values are "pause", "question", "message" or "end" |
| output | object | The object passed back from the knowledge base via the xpertrule.chat function (see below for more details) |
| session | object | An internal session object. You must pass this as the session property of the input message to the NEXT call of xrkb_chat |
| speak | string | Alternative text to send to the text-to-speech processor |
| vocabulary | array of strings | list of words to use as helpers in the speech-to-text conversion |

In the sample URL, the first return will be a "pause" mode. This mode is triggered by the inference engine encountering an xpertrule.chat() call. e.g.

```javascript
xpertrule.chat({
  includeBubble: true,
  css: {
    "background-color": "rgb(42, 100, 180)",
    "color": "rgb(220,220,220)",
    "font-size": "20px",
    "opacity": 1
  },
  speak: "Welcome to our Financial Services Demo",
  contents: "Welcome to our Financial Services Demo"
});
```

*n.b. The xpertrule.chat() call and the subsequent handling of the "pause" mode can be used in numerous ways. In the default UI it is used to render rich messages but can be used for any communication between the server and the client.*

## Anatomy of a conversation (Step 2 - Render the Inference State)

It's now the responsability of the client to render the current state of the engine to the user. In our example, in response to a "pause" mode we just display a message to the user and continue inference.

## Anatomy of a conversation (Step 3 - Continue inference)

In our example, the "pause" mode just displays a message and then continues. To continue inference, we make another call to **xrkb_chat** with the input object having just 2 properties (or 3 if you are supplying a custom engine URL). e.g.

```javascript
xrkb_chat({
    input: "",
    session: {/* previously returned internal session object */}
}, chatCallbackFunction);
```

| Property | Type | Description |
| -------- | ----- | ----------- |
| input    | string | The result of the current state. In the example of "pause" we just want to continue and for this there is not input and so we just pass an empty string. If we were rendering a question, this would be the user's selection |
| session | object | This is the session object returned from the **PREVIOUS** callback from xrkb_chat |

## Anatomy of a conversation (Step 4 - Next Inference Stop Point)

In our example, the next call to the engine stops on our first real question. In this case it's the **Financial_Service** question. The contents of the first parameter passed to the chatCallbackFunction might be something like...

```javascript
{
    ok: true,
    mode: "question",
    questionID: 141,
    allow_blank: false,
    question_mode: "select"
    question_values: [
        {
            id: 1,
            text: "Annuity Advice"
        }, {
            id: 2,
            text: "Trust Advice"
        }
    ],
    output: "What can I advise you on today?"
    speak: "Welcome to our Financial Services Demo",
    vocabulary: [/* array of strings to help the speech to text recogniser */],
    session: {/* internal session object to pass in the next call */}
}
```

Note that the **mode** is now "question"! The **speak**, **vocabulary** and **session** parameters have the same functionality as the first example call so we won't include them in the documentation here

| Property | Type | Description |
| -------- | ----- | ----------- |
| ok       | boolean  | Has the API call been succesful |
| mode     | string | "question" means that we need to request some data from the user |
| questionID | integer | The internal Knowledge Builder ID of this question |
| allow_blank | boolean | Is this question allowed to be left blank? |
| question_mode | string | The type of question. Possible values are "select", "multiple", "numeric", "date" or "text" |
| question_values | array of objects | These are the selection available to the user for this question. Each selection has a unique ID (use for relaying the selection back to the engine) and some text to display|
| output | string | The prompt text to display for this question |

In this example, the client would now render the question. The user would then make their selection and then proceed

## Anatomy of a conversation (Step 5 - Continuing on with User Selections)

Following our example, if the user chose the "Truse Advice" selection, we would again call xrkb_chat using the "input" property to specify the selected value...

```javascript
xrkb_chat({
    input: "\"~2\"",
    session: { /* session object returned by PREVIOUS call */}
}, chatCallbackFunction);
```

As you can see, the **input** property relays the user's selection (id 2 relates to the "Truse Advice" selection as detailed by the question_values property in the question definition)

*n.b. The formatting of the **input** string is important here. Notice that the passed string is double-quote delimited and preceeds the selection id with a tilda (~) symbol! This formatting is only used for "select" type questions*

## Anatomy of a conversation (Step 6 - Response from a User Selection)

The inference now stops on the next question (in our example, this is the **Domiciled** question). The result message not only contains details of the current question, but also details of the previous selection...

```javascript
{
    ok: true,

    previousQuestionID: 141,
    previousValue: "~2",

    mode: "question",
    questionID: 107,
    allow_blank: false,
    question_mode: "select"
    question_values: [
        {
            id: 1,
            text: "Yes"
        }, {
            id: 2,
            text: "No"
        }
    ],
    output: "Are you UK domiciled for Inheritance Tax purposes?<div class=\"more-button\" id=\"Domiciled_exbtn\" onclick=\"extraInfoClick('Domiciled_exbtn', 'Domiciled_exinfo')\">More...",
    speak: "Are you UK domiciled for Inheritance Tax purposes?",
    vocabulary: [/* array of strings to help the speech to text recogniser */],
    session: {/* internal session object to pass in the next call */}
}
```

The content of this message is very similar to the initial question but with the previous response properties supplied...

| Property | Type | Description |
| -------- | ----- | ----------- |
| previousQuestionID | integer | The questionID of the previous question |
| previousValue | string | The selection applied to the knowledge base by the previous selection |

*n.b. The reason for returning the previous selection in this message is that if the previous selection was made via NLP (see future section for more details), the client would only know which selection to make once the engine has returned.*

*n.b. Notice that the **output** property here contains HTML and calls a custom client function "extraInfoClick" in repsonse to clicking the rendered "more" button. This HTML is build dynamically by the engine during inference.*

## Responding to Different Question Types

In response to a **question_mode** of "text" you would simple send the raw text entered by the user. e.g.

```javascript
xrkb_chat({
    input: "This questionaire has been a great experiance",
    session: { /* session object returned by PREVIOUS call */}
}, chatCallbackFunction);
```

**question_mode** of "date" requires that the date be encoded as a string in JSON format. Some sample code to achieve this might look like...
```javascript
var dateObj = new Date(2017, 10, 31);
xrkb_chat({
    input: dateObj.toJSON(),
    session: { /* session object returned by PREVIOUS call */}
}, chatCallbackFunction);
```

For **question_mode** of "number", simple send the number as a string...
```javascript
xrkb_chat({
    input: "42",
    session: { /* session object returned by PREVIOUS call */}
}, chatCallbackFunction);
```

!!! TODO : question_mode of "multiple"

## Responding to Questions via Natural Language

If the user responds to a question via NLP (either by directly entering free-format text or via speech-to-text), this raw text can simply be sent as the **input** parameter. e.g.

```javascript
xrkb_chat({
    input: "I would like some annuity advice please",
    session: { /* session object returned by PREVIOUS call */}
}, chatCallbackFunction);
```

The engine would perform NLP and (if possible) derive a value for the current question.

!!! TODO : response if no match is found

