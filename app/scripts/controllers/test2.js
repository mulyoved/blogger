'use strict';

angular.module('todo')
.controller('Test2Ctrl', function($scope, $log, $q, GAPI, Blogger, blogdb, pouchdb) {

	$scope.$on('event:google-plus-signin-success', function (event,authResult) {
		console.log("Send login to server or save into cookie");
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		console.log("Auth failure or signout detected");
	});	

	$scope.blogId = '4462544572529633201';
	$scope.posts = [];
	$scope.comments = [];

	var loadPosts = function() {

	}

	$scope.authorize = function () {
		GAPI.init(); 
	}

	$scope.answer = "";
	$scope.getBlogByUrl = function() {
		$log.log("getBlogByUrl");


		$scope.answer = Blogger.getBlogByUrl({'url': 'http://mulytestblog.blogspot.co.il/'});
	}

	$scope.posts = "";
	$scope.getPosts = function() {
		$log.log("getOPosts");


		$scope.posts = Blogger.listPosts('4462544572529633201',
			{'fetchBodies': true, 'fetchImages': false, 'maxResults': 10,'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'});


		//fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key={YOUR_API_KEY}

		//https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=false&             fields=items(content%252Cid%252Ckind%252Cpublished%252Cstatus%252Ctitle%252CtitleLink%252Cupdated)%252CnextPageToken&maxResults=10
		//https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key
	};

	var mapPost = function(doc) {
		var timePublished = new Date(doc['published']).getTime();		
		if (doc.kind.endsWith('#post')) {
      		doc['_id'] = 'P' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
      	}
      	else {
      		//doc['_id'] = 'C' + doc.post.id + '#' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
      		doc['_id'] = 'C' + doc.post.id + '#' + (timePublished) + '#' + doc.id;  // for sorting
      	}
        //doc['time_published'] = timePublished;
	};	

	var mapDb2Post = function(post) {
        delete post['_id'];
        delete post['_rev'];
        //delete post['time_published'];
        //delete post['key'];

        return post;
	}

	var bumpDate = function(gapiDate) {
		var date = new Date(gapiDate);
		date = new Date(date.getTime() + 1);

		return date2GAPIDate(date);
	}

	$scope.syncResult = "";
	$scope.sync = function() {
		$scope.syncResult = 'Start Sync';


		var _lastUpdate;
		var _lastUpdateChanged = false;
		var _bloggerList = [];
		blogdb.get('lastUpdate').
		then(function(lastUpdate) {
			// Get last update from DB
			$log.log('lastUpdate', lastUpdate);
			_lastUpdate = lastUpdate;
			if (!_lastUpdate.date) {
				_lastUpdate.date = '';
			}
		}, function(reason) {
			//$log.log('lastUpdate failed', reason);
			_lastUpdate = { _id: 'lastUpdate', date: '' };
		}).
		then(function() {
			// Get all modified posts

			var params = {
				'fetchBodies': true, 
				'fetchImages': false, 
				'maxResults': 10,
				//'startDate': _lastUpdate.date,
				'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'};

			if (_lastUpdate.date.length > 0) {
				params.startDate = bumpDate(_lastUpdate.date);
			}

			return Blogger.listPosts($scope.blogId, params);
		}).
		then(function(list) {
			// Get all modified comments
			if ('items' in list && list.items.length > 0) {
				_bloggerList = list.items;
			}

			var params = {
				'fetchBodies': true, 
				'maxResults': 10,
				//'startDate': _lastUpdate.date,
				'fields': 'items(author/displayName,content,id,kind,post,published,updated),nextPageToken'};

			if (_lastUpdate.date.length > 0) {
				params.startDate = bumpDate(_lastUpdate.date);
			}

			return Blogger.listCommentsByBlog($scope.blogId, params);

		}).
		then(function(list) {
			// Get all documents from DB
			if ('items' in list && list.items.length > 0) {
				// Append list.items to _bloggerList
				_bloggerList.push.apply(_bloggerList, list.items);
			}
			//Get 
			if ('items' in list && list.items.length > 0) {
				return blogdb.allDocs({include_docs: true, attachments: false});
			}
			else {
				return [];
			}
		}).
		then(function(alldocs) {
			//Merge
			var list = _bloggerList;

			if (list.length > 0) {
				//$log.log('list', list)
				$log.log('Blogger -> got answer', list);
				$log.log('DB -> alldocs', alldocs)

				//create dictionary of saved item <id, item>
				var savedItems = {};
				angular.forEach(alldocs.rows, function(item) {
					savedItems[item.id] = item.doc;
				});

				var lastUpdate = _lastUpdate.date;
				var toUpdate = [];
				angular.forEach(list, function(item) {
					if (lastUpdate < item.updated) {
						lastUpdate = item.updated;
					}

					var needUpdate = false;
					var id = item.id;
					//Find saved item
					if (id in savedItems) {
						var savedItem = savedItems[id];
						if (item.updated !== savedItem.updated) {
							$log.log('Items are different blogger:%O data:%O', item, savedItem);
							needUpdate = true;
							item._rev = savedItem._rev;
						}
					}
					else {
						needUpdate = true;
					}

					if (needUpdate) {
						mapPost(item);
						toUpdate.push(item);
					}
				});

				_lastUpdate.date = lastUpdate;
				if (toUpdate.length > 0) {
					_lastUpdateChanged = true;
					return blogdb.bulkDocs({'docs': toUpdate});
				}
			}
			return 0;
		}).then(function(answer) {
			//Save last update date to DB
			if (_lastUpdateChanged) {
				$log.log('All saved', answer);
				$log.log('Update last update', _lastUpdate);
				return blogdb.post(_lastUpdate);
			}
			else {
				$log.log('Nothing to update, all uptodate', answer);
				return 0;
			}
		}).then(function(answer) {
			$scope.syncResult = 'done';
		}, function(reason) {
			$log.error('Sync failed', reason);
		});
	}

	$scope.readAllPosts = function() {
		/*
		var map = function(doc) {
			if ('kind' in doc && doc.kind.endsWith('#post')) {
                emit(doc._id, doc);
            }
        }


		var alldocs = blogdb.query({map: map});
		*/
		var alldocs = blogdb.allDocs({
			include_docs: true, 
			attachments: false,
			startkey: 'P0',
			endkey: 'PZ'
			});

		alldocs.then(function(answer) {
			$log.log('All docs', answer);
			$scope.syncResult = 'done:' + answer.total_rows;
			$scope.posts = answer.rows;
			//console.table(answer.rows);
		}, function(reason) {
			$log.error('readdb failed', reason);
		});
	}

	$scope.readdb = function() {
		var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

		alldocs.then(function(answer) {
			$log.log('All docs', answer);
			$scope.syncResult = 'done:' + answer.total_rows;
			$scope.posts = answer.rows;
		}, function(reason) {
			$log.error('readdb failed', reason);
		});
	}

	$scope.deletedb = function() {
  		pouchdb.destroy('blogdb');
  		pouchdb.create('blogdb');
	}

	$scope.createPost = function() {
		Blogger.insertPosts($scope.blogId, {
			title: 'Test Post2', 
			content: 'Test Content'
		}).
		then(function(answer) {
			$log.log('Answer:', answer);
		});
	}

	$scope.changePost = function() {
		blogdb.allDocs({include_docs: true, attachments: false}).then(function(list) {
			var count =0;
			angular.forEach(list.rows, function(item) {
				if (count < 1 && 'title' in item.doc && !item.doc.title.startsWith('Post#')) {
					var id = item.id;
					item.doc.content = 'Modified: ' + item.doc.content;
					count += 1;
					return Blogger.updatePosts($scope.blogId, id, mapDb2Post(item.doc));
				}
			});
			return 0;
		}).then(function(answer) {
			$log.log('Change post', answer);
		}, function(reason) {
			$log.error('Failed', reason);
		})
	}

	var idToDelete = [];
	var deleteNextPost = function() {
		if (idToDelete.length > 0) {
			var id = idToDelete.pop();
			Blogger.deletePosts($scope.blogId, id).then(function(answer) {
				$log.log('Posts %s deleted %O', id, answer)
				deleteNextPost();
			}, function(reason) {
				$log.error('Posts %s deleted failed %O Aborted', id, reason)
			});
		}
	}

	$scope.deleteAllPosts = function() {
		Blogger.listPosts($scope.blogId, {
				'fetchBodies': true, 
				'fetchImages': false, 
				'maxResults': 10,
				'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'}).
		then(function(list) {
			idToDelete = [];
			if ('items' in list && list.items.length > 0) {
				angular.forEach(list.items, function(item) {
					if (!item.title.startsWith('Post#')) {
						idToDelete.push(item.id);
					}
				});
			}

			deleteNextPost();
		}).
		then(function() {
			//$log.log('Deleted all posts');
		}, function(reason) {
			$log.error('Deleted all posts', reason);
		})
	}

	$scope.postClick = function(post) {
		$log.log('Post clicked',post);
		var postId = post.id;

		/*
		var map = function(doc) {
			if (doc.kind == 'blogger#comment') {

                emit(doc._id, doc);
            }
        }

		var alldocs = blogdb.query({map: map});
		*/

		var alldocs = blogdb.allDocs({
			include_docs: true, 
			attachments: false,
			startkey: 'C'+postId+'#0',
			endkey: 'C'+postId+'#Z'
			});

		alldocs.then(function(answer) {
			$log.log('Comments', answer);
			/*
			var comments = [];
			angular.forEach(answer.rows, function(comment) {
        		if (comment.value.post.id == postId) {
        			comments.push(comment.value);
        		}
			});
			*/
			$scope.syncResult = 'done:' + answer.rows.length;
			$scope.comments = answer.rows;
			console.table(answer.rows);
		}, function(reason) {
			$log.error('readdb failed', reason);
		});
	}

	$scope.createPostDB = function() {
		var time = new Date();

		var post = {
			id: '' + time.getTime(),
			kind: 'db#post',
			title: 'Sample Title' + time.toString(),
			content: 'Sample Content' + time.toString(),
			published: date2GAPIDate(time),
		}

		mapPost(post);
		blogdb.post(post);
	}

});
