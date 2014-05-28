(function(){
  Parse.initialize("jcp0jI9xxoj8iL2R5pMT0AvnEZB4cipTb2MEe4zH",
    "G0Z7lxqZOEm9f3C4oeK0eiQZBkvSg9eIZ2DknTXe");

  var templates = {};
  ["loginView", "evaluationView", "updateSuccessView"].forEach(function (e) {
    templateCode = document.getElementById(e).text;
    templates[e] = doT.template(templateCode);
  });

  var handlers = {
    navbar: function () {
      var currentUser = Parse.User.current();
      if (currentUser) {
        document.getElementById("loginButton").style.display = "none";
        document.getElementById("logoutButton").style.display = "block";
        document.getElementById("evaluationButton").style.display = "block";
      } else {
        document.getElementById("loginButton").style.display = "block";
        document.getElementById("logoutButton").style.display = "none";
        document.getElementById("evaluationButton").style.display = "none";
      }
      document.getElementById("logoutButton").addEventListener('click', function () {
        window.location.hash = "login/";
        Parse.User.logOut();
        handlers.navbar();
        
      })
    },

    loginView: function(){
      //把版型印到瀏覽器上();
      document.getElementById("content").innerHTML= templates.loginView(); 
      //綁定登入表單的學號檢查事件();
      document.getElementById("form-signin-student-id").addEventListener("keyup",function(){
        if(TAHelp.getMemberlistOf(document.getElementById("form-signin-student-id").value)){
        document.getElementById("form-signin-message").style.display="none";
      }
        else{
        document.getElementById("form-signin-message").innerHTML="The student is not one of the class students.";
        document.getElementById("form-signin-message").style.display="block";
      }
      })
      //綁定註冊表單的學號檢查事件();
      document.getElementById("form-signup-student-id").addEventListener("keyup",function(){
        if(TAHelp.getMemberlistOf(document.getElementById("form-signup-student-id").value)){
        document.getElementById("form-signup-message").style.display="none";
      }
        else{
        document.getElementById("form-signup-message").innerHTML="The student is not one of the class students.";
        document.getElementById("form-signup-message").style.display="block";
      }
      })
      //綁定註冊表單的密碼檢查事件();
      document.getElementById("form-signup-password1").addEventListener("keyup",function(){
        if(document.getElementById("form-signup-password1").value === document.getElementById("form-signup-password").value){
          document.getElementById("form-signup-message").style.display="none";
        }
        else{
          document.getElementById("form-signup-message").innerHTML="Password isn't the same!";
          document.getElementById("form-signup-message").style.display="block";
        }
      })
      //綁定登入表單的登入檢查事件();
      document.getElementById("form-signin").addEventListener("submit",function(){
        var input_id = document.getElementById("form-signin-student-id").value;
        var input_password = document.getElementById("form-signin-password").value;
        Parse.User.logIn(input_id,input_password, {
          success: function(user) {
          window.location.hash="peer-evaluation/";
          handlers.navbar();
          },
          error: function(user, error) {
            console.log('login fail');
          }
        });
      })
      //綁定註冊表單的註冊檢查事件();
      document.getElementById("form-signup").addEventListener("submit",function(){
        var user = new Parse.User();
            user.set("username", document.getElementById('form-signup-student-id').value);
            user.set("password", document.getElementById('form-signup-password').value);
            user.set("email", document.getElementById('form-signup-email').value);
            user.signUp(null, {
                success: function(user){
                  alert('success');
                },
                error: function(user, error){
                  alert('fail');
                }
            });
      })
    },
    
    evaluationView: function(){
        var currentUser = Parse.User.current();
        if(currentUser){
          var Evaluation = Parse.Object.extend('Evaluation');
          var currentUserId=currentUser.get("username");
          var team=TAHelp.getMemberlistOf(currentUserId);
          var teamMember=[];
          var query=new Parse.Query(Evaluation);
          query.equalTo("user",currentUser);
          query.first({
            success:function(result){
              if(result===undefined){
                for(var i=0;i<team.length;i++){
                  if(team[i].StudentId!=currentUserId){

                    team[i].scores = ["0","0","0","0"];
                    teamMember.push(team[i]);
                  } 
                }
                
                var evaluationACL = new Parse.ACL();
                      evaluationACL.setPublicReadAccess(false);
                      evaluationACL.setPublicWriteAccess(false);
                      evaluationACL.setReadAccess(currentUser, true);
                      evaluationACL.setWriteAccess(currentUser, true);

                var evaluation=new Evaluation();
                document.getElementById("content").innerHTML=templates.evaluationView(teamMember);
                

                document.getElementById('evaluationForm').addEventListener('submit', function(){
                for(var i=0; i<teamMember.length; i++){
                    for(var j=0; j<teamMember[i].scores.length; j++){
                      var el=document.getElementById("stu"+teamMember[i].StudentId+"-q"+j);
                      var point=el.options[el.selectedIndex].value;
                      teamMember[i].scores[j]=point;
                    }
                  }

                  
                  evaluation.set("user",currentUser);
                  evaluation.setACL(evaluationACL); 
                  evaluation.set("evaluation",teamMember);
                  evaluation.save(null,{
                    success:function(object){
                      document.getElementById("content").innerHTML=templates.updateSuccessView();

                    },
                  error:function(object,error){
                      console.log('error');     
                    }

                  })

                  
                        
                })
                }else{
                teamMember=result.toJSON().evaluation;

                document.getElementById("content").innerHTML=templates.evaluationView(teamMember);
                document.getElementById("evaluationForm-submit").value="修改表單";
              
                document.getElementById('evaluationForm').addEventListener('submit', function(){
                
                  
                for(var i=0; i<teamMember.length; i++){
                    for(var j=0; j<teamMember[i].scores.length; j++){
                      var el=document.getElementById("stu"+teamMember[i].StudentId+"-q"+j);
                      var point=el.options[el.selectedIndex].value;
                      teamMember[i].scores[j]=point;
                    }
                  }
                
                  result.set("evaluation",teamMember);
                  result.save(null,{
                    success:function(){       
                      document.getElementById("content").innerHTML=templates.updateSuccessView();
                    },
                    error:function(){
                      
                    }
                  })
                })
            }

            },
            error:function(result,error){

            }
          });
      }
        else{
          window.location.hash="login/";
        }
     }
   }
   var Router = Parse.Router.extend({
    routes: {
      "": "indexView",
      "peer-evaluation/": "evaluationView",
      "login/*redirect": "loginView",
    },
    indexView: handlers.evaluationView,
    evaluationView: handlers.evaluationView,
    loginView: handlers.loginView,
  });

  this.Router = new Router();
  Parse.history.start();
  handlers.navbar();

})();
