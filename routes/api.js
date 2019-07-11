const request = require('superagent');

module.exports = ({ apiRouter }) => {
    const firstLevelFollowers = []
    const secondLevelFollowers = []
    const thirdLevelFollowers = []
   
    apiRouter.get(`/users/:id`, async (ctx, next) => {
    let id = ctx.params.id
      await request  
        .get(`https://api.github.com/user/${id}?client_id=28fa4b2fe70680431a79&client_secret=f9c9d3eb150646ccff777e699b755659eff5e920`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
        
        .then(res => {
            ctx.body = JSON.stringify(res.body, null, 2)
        })
        .catch(err => {
          console.log(err);
        });
    });
  
    apiRouter.get('/users/:id/followers', async (ctx, next) => {
  
    const id = ctx.params.id
    async function levelOneGithubFollowers() {
     
     await  request
        .get(`https://api.github.com/user/${id}/followers?per_page=5&client_id=28fa4b2fe70680431a79&client_secret=f9c9d3eb150646ccff777e699b755659eff5e920`)
        .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
        .then(res => {
          for (let i in res.body) {
          let followersUrl = res.body[i]  
          firstLevelFollowers.push(followersUrl)
         } 
        }).catch(err => {
          console.log(err);
        });
        
      }
      
       async function levelTwoFollowers() {
         
          for (let follower of firstLevelFollowers) {
            
           await request.get(follower.followers_url + `?per_page=5&client_id=28fa4b2fe70680431a79&client_secret=f9c9d3eb150646ccff777e699b755659eff5e920`)
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
            .then(res2 => {
                thirdLevelFollowers.push('level one: '+ follower.id)
                for (i in res2.body){
                  let followers = res2.body[i]  
                    secondLevelFollowers.push(followers)    
                 }
              
                }).catch(err => {
                  console.log(err);
            });
          
          for (let url of secondLevelFollowers) {
            if (!thirdLevelFollowers.includes(' level two: ' + url.id)) {
           await request.get(url.followers_url + `?per_page=5&client_id=28fa4b2fe70680431a79&client_secret=f9c9d3eb150646ccff777e699b755659eff5e920`)
            .set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36')
            .then(res3 => {
                thirdLevelFollowers.push(' level two: ' + url.id)
                for (i in res3.body){         
                  let followers = res3.body[i].id   
                  thirdLevelFollowers.push('  level three: ' + followers)
                }
              }).catch(err => {
                  console.log(err);
            });
            }else {
              continue;
            }
          }  
        }
           ctx.body = JSON.stringify({thirdLevelFollowers}, null, 2)
      }  
       
await Promise.all([
    levelOneGithubFollowers()])
    await next().then(await levelTwoFollowers())
        }) 
    
};