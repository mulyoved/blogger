'use strict';

angular.module('todo')
.controller('Test2Ctrl', function($scope, $log, $q, GAPI, Blogger, blogdb, pouchdb) {

	$scope.$on('event:google-plus-signin-success', function (event, authResult) {
		console.log('Send login to server or save into cookie');
	});
	$scope.$on('event:google-plus-signin-failure', function (event,authResult) {
		console.log('Auth failure or signout detected');
	});

	$scope.blogId = '4462544572529633201';
	$scope.posts = [];
	$scope.post = {};
	$scope.comments = [];
	$scope.comment = {};
	$scope.answer = '';
	$scope.syncResult = '';

	$scope.authorize = function () {
		GAPI.init();
	};

	$scope.getBlogByUrl = function() {
		$log.log('getBlogByUrl');


		$scope.answer = Blogger.getBlogByUrl({'url': 'http://mulytestblog.blogspot.co.il/'});
	};

	$scope.getPosts = function() {
		$log.log('getOPosts');


		$scope.posts = Blogger.listPosts('4462544572529633201',
			{'fetchBodies': true, 'fetchImages': false, 'maxResults': 10,'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'});


		//fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key={YOUR_API_KEY}

		//https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=false&             fields=items(content%252Cid%252Ckind%252Cpublished%252Cstatus%252Ctitle%252CtitleLink%252Cupdated)%252CnextPageToken&maxResults=10
		//https://www.googleapis.com/blogger/v3/blogs/6225549217598152239/posts?fetchBodies=true&fetchImages=true&maxResults=10&fields=items(content%2Cid%2Ckind%2Cpublished%2Cstatus%2Ctitle%2CtitleLink%2Cupdated)%2CnextPageToken&key
	};

	var mapPost = function(doc) {
		var timePublished = new Date(doc.published).getTime();
		if (doc.kind.startsWith('delete#')) {
			doc._id = 'D' + doc.id;
		}
		else if (doc.kind.endsWith('#post')) {
			doc._id = 'P' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
		}
		else {
			//doc['_id'] = 'C' + doc.post.id + '#' + (2000000000000 - timePublished) + '#' + doc.id;  // for sorting
			doc._id = 'C' + doc.post.id + '#' + (timePublished) + '#' + doc.id;  // for sorting
		}
        //doc['time_published'] = timePublished;
	};

	var mapDb2Post = function(post) {
		delete post._id;
		delete post._rev;
		delete post.key;
		//delete post['time_published'];
		//delete post['key'];

		return post;
	};

	var bumpDate = function(gapiDate) {
		var date = new Date(gapiDate);
		date = new Date(date.getTime() + 1);

		return date2GAPIDate(date);
	};

	var blogger_getModifiedDocuments = function(lastUpdate) {
		var _bloggerList = [];

		var params = {
			'fetchBodies': true,
			'fetchImages': false,
			'maxResults': 10,
			//'startDate': _lastUpdate.date,
			'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'
		};

		if (lastUpdate.length > 0) {
			params.startDate = bumpDate(lastUpdate);
		}

		var promise = Blogger.listPosts($scope.blogId, params).
		then(function(list) {
			// Get all modified comments from Blogger
			if ('items' in list && list.items.length > 0) {
				_bloggerList = list.items;
			}

			var params = {
				'fetchBodies': true,
				'maxResults': 10,
				//'startDate': _lastUpdate.date,
				'fields': 'items(author/displayName,content,id,kind,post,published,updated),nextPageToken'
			};

			if (lastUpdate.length > 0) {
				params.startDate = bumpDate(lastUpdate);
			}

			return Blogger.listCommentsByBlog($scope.blogId, params);
		}).
		then(function(list) {
			// Get all documents from DB
			if ('items' in list && list.items.length > 0) {
				// Append list.items to _bloggerList
				_bloggerList.push.apply(_bloggerList, list.items);
			}

			return _bloggerList;
		});

		return promise;
	};

	var proccessArray = function(arr, promise) {
		var item = arr.pop();
		var p = promise(item).
		then(function(answer) {
			//$log.log('Success: ',greeting);
			if (arr.length > 0) {
				return prommiseArray(arr, promise);
			}
			else {
				return 0;				
			}
		});

		return p;
	}

	var updateBlogger = function(_doc) {
		var doc = _doc.value;
		var orgDoc = JSON.parse(JSON.stringify(doc));
		var promise;
		$log.log('to Update', doc);

		var kind = doc.kind;
		var id = doc.id;
		var isPost = kind.endsWith('#post');
		mapDb2Post(doc);
		$log.log('to Update Clean', doc);

		if (id.startsWith('G')) {
			delete doc.id; 
			delete doc.kind; 

			if (isPost) {
				promise = Blogger.insertPosts($scope.blogId, doc);
			}
			else {
				promise = Blogger.insertComments($scope.blogId, doc);
			}
			promise.
			then(function(answer) {
				$log.log('insertPosts Answer:', answer);
				var item = answer;

				return blogdb.remove(orgDoc).
				then(function(answer) {
					mapPost(item);
					item.key = item.id;
					return blogdb.post(item);
				});
			});
		}
		else {
			promise = Blogger.updatePosts($scope.blogId, id, doc);
			promise.
			then(function(answer) {
				$log.log('updatePosts Answer:', answer);
				mapPost(item);
				item.key = item.id;
				return blogdb.post(item);
			});
		}
	}


	var db_getAllModifiedDocuments = function() {
		var queryFun = {
			map: function(doc) { emit(doc.key, doc); }
		};

		var alldocs = blogdb.query(queryFun, {reduce: false, key: 'U'});

		/*
		var alldocs = blogdb.allDocs({
			include_docs: true,
			attachments: false,
			keys: 'U'
		});
		*/

		alldocs.then(function(answer) {
			$log.log('List of updated documents', answer);
			if (answer.total_rows > 0) {
				return proccessArray(answer.rows, updateBlogger);
			}
			else {
				return 0;
			}
		});

		return alldocs;
	};

	//Test
	$scope.syncModifiedDocuments = function() {
		db_getAllModifiedDocuments().
		then(function(answer) {
			$log.log('syncModifiedDocuments completed', answer);
		}, function(reason) {
			$log.error('syncModifiedDocuments Failed', reason)
		})
	}

	$scope.sync = function() {
		$scope.syncResult = 'Start Sync';


		var _lastUpdate;
		var _lastUpdateChanged = false;
		var _bloggerList = [];

		//Update DB->Blogger
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
			// Get all modified posts from Blogger
			return blogger_getModifiedDocuments(_lastUpdate.date);
		}).
		then(function(list) {
			_bloggerList = list;

			//Get all documents in database
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
				$log.log('DB -> alldocs', alldocs);

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
						item.key = item.id;
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
	};

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
	};

	$scope.readdb = function() {
		var alldocs = blogdb.allDocs({include_docs: true, attachments: true});

		alldocs.then(function(answer) {
			$log.log('All docs', answer);
			$scope.syncResult = 'done:' + answer.total_rows;
			//$scope.posts = answer.rows;
			console.table(answer.rows);
		}, function(reason) {
			$log.error('readdb failed', reason);
		});
	};

	$scope.deletedb = function() {
		pouchdb.destroy('blogdb');
		pouchdb.create('blogdb');
	};

	$scope.createPost = function() {
		Blogger.insertPosts($scope.blogId, {
			title: 'Test Post2',
			content: 'Test Content'
		}).
		then(function(answer) {
			$log.log('Answer:', answer);
		});
	};

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
		});
	};

	var idToDelete = [];
	var deleteNextPost = function() {
		if (idToDelete.length > 0) {
			var id = idToDelete.pop();
			Blogger.deletePosts($scope.blogId, id).then(function(answer) {
				$log.log('Posts %s deleted %O', id, answer);
				deleteNextPost();
			}, function(reason) {
				$log.error('Posts %s deleted failed %O Aborted', id, reason);
			});
		}
	};

	$scope.deleteAllPosts = function() {
		Blogger.listPosts($scope.blogId, {
			'fetchBodies': true,
			'fetchImages': false,
			'maxResults': 10,
			'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'
		}).
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
		});
	};

	var getAllComments = function(postId, include_docs) {
		return blogdb.allDocs({
			'include_docs': include_docs,
			attachments: false,
			startkey: 'C'+postId+'#0',
			endkey: 'C'+postId+'#Z'
		});
	};

	$scope.postClick = function(post) {
		$log.log('Post clicked',post);
		$scope.post = post;
		var postId = post.id;

		var alldocs = getAllComments(postId, true);
		alldocs.then(function(answer) {
			$log.log('Comments', answer);
			$scope.syncResult = 'done:' + answer.rows.length;
			$scope.comments = answer.rows;
			console.table(answer.rows);
		}, function(reason) {
			$log.error('readdb failed', reason);
		});
	};

	$scope.commentClick = function(comment) {
		$scope.comment = comment;
		$scope.answer = JSON.stringify(comment, undefined, 2);
	};

	$scope.createPostDB = function() {
		var time = new Date();

		var post = {
			id: 'G' + time.getTime(), // Generated ID
			kind: 'db#post',
			title: 'Sample Title' + time.toString(),
			content: 'Sample Content' + time.toString(),
			published: date2GAPIDate(time),
			key: 'U'
		};

		mapPost(post);
		blogdb.post(post);
	};

	var execute = function(promise, taskName) {
		promise.then(function(answer) {
			$log.log('Completed %s: %O', taskName, answer);
		}, function (reason) {
			$log.error('Failed to execute %s: %O', taskName, reason);
		});
	};

	$scope.changePostDB = function() {
		var time = new Date();

		var post = $scope.post;
		post.kind =  'db#post';
		post.title = 'Sample Title' + time.toString();
		post.content = 'Sample Content' + time.toString();
		post.key =  'U';

		mapPost(post);
		blogdb.post(post).then(function(answer) {
			$log.log('Completed changePostDB: %O', answer);
			post._id = answer.id;
			post._rev = answer.rev;
		}, function (reason) {
			$log.error('Failed to execute changePostDB: %O', reason);
		});
	};

	$scope.createCommentDB = function() {
		if ($scope.post.kind.startsWith('blogger#')) {
			var time = new Date();

			var post = {
				id: 'G' + time.getTime(), // Generated ID
				kind: 'db#comment',
				content: 'Comment' + time.toString(),
				published: date2GAPIDate(time),
				key: 'U',
				post: {
					id: $scope.post.id
				}
			};

			mapPost(post);
			blogdb.post(post).then(function(answer) {
				$log.log('Completed createCommentDB: %O', answer);
				post._id = answer.id;
				post._rev = answer.rev;
			}, function (reason) {
				$log.error('Failed to execute createCommentDB: %O', reason);
			});
		}
		else {
			$log.error('Cannot add comment to unpublished post');
		}
	};

	$scope.deletePostDB = function() {
		var post = $scope.post;

		//todo
		//Save for syncronization
		var _post = JSON.parse(JSON.stringify(post));

		post.kind = 'delete#post';
		mapDb2Post(post);
		mapPost(post);
		post.key = 'D';

		$log.log('Start deletePostDB', post);
	
		blogdb.remove(_post).
		then(function(answer) {
			$log.log('Post deleted', answer);
			return getAllComments(_post.id, true);
		}).
		then(function(answer) {
			$log.log('All comments', answer);
			var delAllComments = [];
			angular.forEach(answer.rows, function(comment) {
				delAllComments.push(blogdb.remove(comment.doc));
			});

			return $q.all(delAllComments);
		}).
		then(function(answer) {
			$log.log('All comments deleted', answer);
			if (post.kind.startsWith('blogger#')) {
				return blogdb.post(post);
			}
			else {
				$log.log('Post was not published, no need to save as deleted');
				return 0;
			}
		}).
		then(function(answer) {
			$log.log('Post saved as deleted', answer);
		}, function(reason) {
			$log.error(reason);
		});

		//Remove from database		
	};

	$scope.deleteCommentDB = function() {
		var post = $scope.comment;

		//todo
		//Save for syncronization
		var _post = JSON.parse(JSON.stringify(post));

		post.kind = 'delete#comment';
		mapDb2Post(post);
		mapPost(post);
		post.key = 'D';

		$log.log('Start deleteCommentDB', post);
	
		blogdb.remove(_post).
		then(function(answer) {
			$log.log('Comment deleted', answer);
			if (post.kind.startsWith('blogger#')) {
				return blogdb.post(post);
			}
			else {
				$log.log('Comment was not published, no need to save as deleted');
				return 0;
			}
		}).
		then(function(answer) {
			$log.log('Comment saved as deleted', answer);
		}, function(reason) {
			$log.error(reason);
		});
	};


});
