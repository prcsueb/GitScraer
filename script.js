const request = require('request');
const fs = require('fs')
const cheerio = require('cheerio')
let store;
let data={}

function f(error, response, body) {
  if(!error && response.statusCode === 200) {
    fs.writeFileSync("index.html",body);
    store = cheerio.load(body); //load kari ne object banave then ane store ni under transfer kari de
    //sotre(css selector) variable ne call kari as a arg css selector pass karai
    let allTopics = store(".no-underline.d-flex.flex-column.flex-justify-center"); //css selector no use kari ne ek <a> tag no array mde ane allTopic ni under save karyo
    let allTopicNames = store(".f3.lh-condensed.text-center.Link--primary.mb-0.mt-1");
    for(let i=0;i<3;i++) {
      let url = "www.github.com" + store(allTopics[i]).attr("href");
      let topicName = store(allTopicNames[i]).text().trim();
      console.log(url); //ae array mathi href attribute get karyu bus
      console.log(topicName);
      getTopicsPage(topicName, "https://"+url);
    }
  }
}

request("https://github.com/topics", f);

function getTopicsPage(name, url) {
  request(url, function (error, response, body) {
    if(!error && response.statusCode === 200) {
      store = cheerio.load(body);
      allTopicNames = store(".f3.color-text-secondary.text-normal.lh-condensed .text-bold");
      for(let i=0;i<allTopicNames.length;i++) {
        let projectname = store(allTopicNames[i]).text().trim();
        console.log(projectname);
        let projecturl = "https://github.com/"+store(allTopicNames[i]).attr("href");
        if(!data[name]) {
          data[name] = [{name: projectname, link: projecturl}];
        } else {
          data[name].push({name: projectname, link: projecturl});
        }
        console.log(projecturl+"/issues");
        getIssues(projectname, name, projecturl+"/issues");
      }
      fs.writeFileSync("data.json",JSON.stringify(data));
    }
});
}

function getIssues(projectname, topicname, url) {
  request(url, function (error, response, body) {
    if(!error && response.statusCode === 200) {
      store = cheerio.load(body);
      let issues = store(".Link--primary.v-align-middle.no-underline.h4.js-navigation-open.markdown-title");
      for(let i=0;i<issues.length;i++) {
        let issueUrl = "https://github.com/" + store(issues[i]).attr('href');

        let issueTitle = store(issues[i]).text().trim();
        
        //finding project in data json object and if exists push or add new one
        let index=-1;
        for(let i=0;i<data[topicname].length;i++) {
          if(data[topicname][i].name===projectname) {
            index=i;
            break;
          }
        }

        console.log(`index = ${index}`);

        if(!data[topicname][index].issues) {
          data[topicname][index].issues = [{ issueTitle,issueUrl }];
        } else {
          data[topicname][index].issues.push({ issueTitle,issueUrl });
        }
      }

        fs.writeFileSync("data.json",JSON.stringify(data));


    }
  });
}

console.log(data);