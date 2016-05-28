var PACKAGE_TEMPLATE = '\
<div>\
  <h1><a href="{{repository_url}}">{{platform}}/{{name}}</a></h1>\
  <ul>\
    <li>\
      <label>Stars</label>\
      <span>{{stars}}</span>\
    </li>\
    <li>\
      <label>Source Rank</label>\
      <span>\
        <a href="https://libraries.io/{{platform}}/{{name}}/sourcerank">{{rank}}</a>\
      </span>\
    </li>\
    <li>\
      <label>Versions</label>\
      <span>{{version_count}}</span>\
    </li>\
    <li>\
      <label>Latest Version</label>\
      <span>{{latest_version}}</span>\
    </li>\
    <li>\
      <label>Dependent Project</label>\
      <span>{{dependent_project_count}}</span>\
    </li>\
    <li>\
      <label>Dependent Repos</label>\
      <span>{{dependent_repo_count}}</span>\
    </li>\
  </ul>\
</div>\
';

var Prototype = Object.create(HTMLElement.prototype);

var PROJECT_DETAILS_URL = 'https://libraries.io/api/:package-platform/:package-name';
var PROJECT_DEPENDENTS = 'https://libraries.io/api/:package-platform/:package-name/dependents';
var PROJECT_DEPENDENT_REPOS = 'https://libraries.io/api/:package-platform/:package-name/dependent_repositories';

Prototype.attachedCallback = function() {
  var packagePlatform = this.getAttribute('package-platform');
  var packageName = this.getAttribute('package-name');
  
  var projectUrl = PROJECT_DETAILS_URL
                    .replace(':package-platform', encodeURIComponent(packagePlatform))
                    .replace(':package-name', encodeURIComponent(packageName));
                    
  var dependentsUrl = PROJECT_DEPENDENTS
                      .replace(':package-platform', encodeURIComponent(packagePlatform))
                      .replace(':package-name', encodeURIComponent(packageName));
                    
  var dependentReposUrl = PROJECT_DEPENDENT_REPOS
                        .replace(':package-platform', encodeURIComponent(packagePlatform))
                        .replace(':package-name', encodeURIComponent(packageName));

  var projectRequest = fetch(projectUrl);
  var dependentsRequest = fetch(dependentsUrl);
  var dependentReposRequest = fetch(dependentReposUrl);
  
  Promise.all([projectRequest, dependentsRequest, dependentReposRequest])
    .then(this._handleData.bind(this))
    .catch(function(err) {
      console.error(err);
    });
};

Prototype._handleData = function(results) {
  var getProjectData = results[0].json();
  var getDepedentData = results[1].json();
  var getDependentRepoData = results[2].json();
  
  Promise.all([getProjectData, getDepedentData, getDependentRepoData])
    .then(this._renderResults.bind(this))
    .catch(function(ex) {
      console.error(ex);
    });
};

Prototype._renderResults = function(values) {
  console.log(values);
  
  var projectData = values[0];
  var dependentData = values[1];
  var depedentRepoData = values[2];
  
  var html = PACKAGE_TEMPLATE;
  Object.keys(projectData).forEach(function(key) {
    var regex = new RegExp('{{' + key + '}}', 'g');
    html = html.replace(regex, projectData[key]);
  });
  
  html = html.replace('{{repository_url_trimmed}}', projectData.repository_url.replace('https://', ''));
  
  html = html.replace('{{latest_version}}', projectData.versions[projectData.versions.length-1].number);
  html = html.replace('{{version_count}}', projectData.versions.length);
  
  html = html.replace('{{dependent_project_count}}', dependentData.length);
  html = html.replace('{{dependent_repo_count}}', depedentRepoData.length);
  
  this.innerHTML = html;
};

document.registerElement('librariesio-project-stats', {
  prototype: Prototype
});
