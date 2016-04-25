import { Component, OnInit } from 'angular2/core';
import { UserService } from './services/user.service';
import { User } from './classes/User'
import {RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';
import {Info} from "./classes/Info";
import {Instrument} from "./classes/Instrument";
import {IntrumentList} from "./classes/InstrumentList";
import {GenreList} from "./classes/GenreList";
import {FollowService} from "./services/follow.service";
import {MessageService} from "./services/message.service";
import { BlogUser } from "./classes/BlogUser";
import { BlogService } from "./services/blog.service";
import { BandService } from "./services/band.service";

@Component({
  selector: 'artista',
  templateUrl: 'templates/artista.html',
  providers: [UserService, FollowService, MessageService, BlogService, BandService],
  directives: [ROUTER_DIRECTIVES]
})

export class ArtistaComponent {

  isUserLogged: boolean;
  isArtist: boolean;
  isFollowed: boolean;
  user: User;
  instruments: Instrument[] = [];
  instruments_url:string[] = [];
  genresUser:string[] = [];
  id;
  blogList:BlogUser[] = [];
  bands = [];  

  //Follows variables
  numFollowing:number;
  numFollowers:number;

  //Notification
  numMessages:number;

  constructor(private _routeParams: RouteParams, private _userService: UserService,
                private _followService: FollowService, private _messageService: MessageService,
                private _bandService:BandService, private _blogService: BlogService){
  }

  ngOnInit() {

      this.initialization();
      if (this.isArtist) {
          this.instrumentsUser();
      }
      this.genres();
      this.isFollowedBy();
      this.bandsUser();
  }


    initialization(){

        //Get id from route
        this.id = this._routeParams.get('id')

        //Check if is userLogged to show edit buttons
        this.isUserLogged = (this.id == Info.userId);

        //Get user information
        this._userService.getUserById(this.id).subscribe(
            user => this.user = user
        )
        //Check if is an artist
        this.isArtist = this.user.isArtist;

        this.updateFollows();

        this._messageService.getNumNonRead(Info.userId).subscribe(
            (num => this.numMessages = num),
            (error => alert("Error notifications"))
        )

        this._blogService.getBlogsByUser(this.user).subscribe(
          blogList => this.blogList = blogList
        )


    }

    bandsUser(){
        this._bandService.getBandsByUser(this.id).subscribe(
            list => this.bands = list,
            error => {
                this.bands = null;
                alert ("Error");
            }
        );
        console.log(this.bands);
    }

    instrumentsUser() {
      if (this.isArtist){
          var allInstruments:IntrumentList = new IntrumentList();
          for (let i = 0; i < allInstruments.instruments.length; i++) {
              if (this.user.instruments.indexOf(i) != -1) {;
                  this.instruments.push(allInstruments.instruments[i]);
                  this.instruments_url.push(allInstruments.instruments[i].image_url);
              }
          }
      }
    }

    genres(){
        var allGenres:GenreList = new GenreList();
        for(let i = 0; i < allGenres.genres.length; i++){
            if(this.user.genres.indexOf(i) != -1){
                this.genresUser.push(allGenres.genres[i].name);
                console.log(allGenres.genres[i].name);
            }
        }
    }

    goToURL (){
      console.log(this.user.twitter);
        console.log("Entro en click");
      window.open(this.user.twitter);
    }

    updateFollows(){
        this._followService.getNumFollowersById(this.id).subscribe(
            (followers => this.numFollowers = followers),
            (error => alert("numFollowers error"))
        )
        this._followService.getNumFollowingByID(this.id).subscribe(
            (followings => this.numFollowing = followings),
            (error => alert("numFollowings error"))
        );
    }
    

    isFollowedBy() {
      this._followService.isUserFollowedBy(Info.userLogged, this.user).subscribe(
        (followed => this.isFollowed = followed),
        (error => alert("isUserFollowedBy error"))
      );
    }

    setFollow() {
      this._followService.setFollow(Info.userLogged, this.user);
      this.isFollowed = true;
      this.numFollowers++;
    }

    setUnfollow() {
      this._followService.setUnfollow(Info.userLogged, this.user);
      this.isFollowed = false;
      this.numFollowers--;
    }
    
    submitBlog(title, img, text){
        var user: User=Info.userLogged;
        this._blogService.addBlogUsser(title, img, text, new Date, user);
        
        this._blogService.getBlogsByUser(this.user).subscribe(
            blogList => this.blogList = blogList
        )

    }
    
    newBand (nameBand, description){
        this._bandService.addNewBand(nameBand,description);
        this.bandsUser();
    }

}