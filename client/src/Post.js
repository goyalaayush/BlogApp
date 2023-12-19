import {formatISO9075} from "date-fns";
import {Link} from "react-router-dom";
import {UserContext} from "./UserContext";
import { useContext,useState } from "react";
import { Navigate } from "react-router-dom";



export default function Post({_id,title,summary,cover,content,createdAt,author}) {

  function fun()

  {
        if(!username)alert('Please register or sigin to read the blog')
  }

 

  const {userInfo,setUserInfo} = useContext(UserContext);
  

  const username = userInfo?.username;

  return (

    <div className="post">
      <div className="image">

        <Link to={username?`/post/${_id}`:'/'} onClick={fun}>
          <img src={'http://localhost:4000/'+cover} alt=""/>
        </Link>
      </div>
      <div className="texts">
        <Link to={username?`/post/${_id}`:'/'}>
        <h2>{title}</h2>
        </Link>
        <p className="info">
          <a className="author">{author.username}</a>
        
          <time>{formatISO9075(new Date(createdAt))}</time>
        </p>
        <p className="summary">{summary}</p>
     
      </div>
    </div>
    


  );
}