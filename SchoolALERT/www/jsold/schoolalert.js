/**
  *  ____       _                 _    _    _           _   
  * / ___|  ___| |__   ___   ___ | |  / \  | | ___ _ __| |_ 
  * \___ \ / __| '_ \ / _ \ / _ \| | / _ \ | |/ _ \ '__| __|
  *  ___) | (__| | | | (_) | (_) | |/ ___ \| |  __/ |  | |_ 
  * |____/ \___|_| |_|\___/ \___/|_/_/   \_\_|\___|_|   \__|
  *
  *     The Client
  */

/* for some reason webview will turn white, this puts it back to normal */

function getTextWidth(text, font) {
    // re-use canvas object for better performance
    var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    var context = canvas.getContext("2d");
    context.font = font;
    var metrics = context.measureText(text);
    return metrics.width;
};


window.javafxFix = function() {
    jQuery('html').hide();
    setTimeout(function() {
        jQuery('html').show();
    }, 1);
}

//$.jGrowl.defaults.position = 'bottom-right';

jQuery.fn.redraw = function() {
    return this.hide(0, function() {
        $(this).show();
    });
};

var SND_CHECK_IN = new buzz.sound('snd/checkin.mp3');
var SND_NEXT = new buzz.sound('snd/checkin-next.mp3');
var SND_NOTIF = new buzz.sound('snd/notif.mp3');

(function($) {

    var app = angular.module('SchoolAlert', ['ngSanitize'])
        .run(function($rootScope) {
			if(localStorage['siteUrl']) {
				var prefix = ['https://', 'http://'];
				
				for(i in prefix) {
					if(localStorage['siteUrl'].indexOf(prefix[i]) > -1) {
						localStorage.setItem('siteUrl', localStorage['siteUrl'].substring(prefix[i].length));
					}
				}
			}
			
            $rootScope.url = localStorage['siteUrl'] || null;
            $rootScope.code = localStorage['deviceHash'] || null;
            $rootScope.compactView = localStorage['compactView'] === 'true';
            $rootScope.playSounds = (localStorage['playSounds'] || true) === 'true';
            $rootScope.currentPage = 'network';
            $rootScope.checkins = [];
            $rootScope.notifications = [];
            $rootScope.pages = {
                network: {
                    pos: 1,
                    icon: { menu: 'fa-home', page: '' },
                    text: '<i class="fa fa-spinner fa-spin"></i> Connecting ...'
                },
                settings: {
                    pos: 4,
                    icon: { menu: 'fa-cogs', page: 'fa-cog' },
                    text: 'Settings'
                },
                checkins: {
                    pos: 2,
                    icon: { menu: 'fa-bullhorn'},
                    text: 'Checkins'
                },
                notifications: {
                    pos: 3,
                    icon: { menu: 'fa-comments'},
                    text: 'Notifications'
                }
            };

				// http://alertsrv.com:4000'
            $rootScope.ioConnect = function() {
                var socket = io('http://alertsrv.com:4000', {query: 'authCode=' + $rootScope.code + '&authUrl=' + $rootScope.url});

                $rootScope.sendPost = function(postInfo) {
                    socket.emit('send_post', postInfo);
                };

                $rootScope.testConnection = function(url, authCode) {
                    socket.emit('test_connection', url, authCode);
                }
                
                socket.on('network', function(network) {
                    if(!$rootScope.pages.network.icon.page.length) {
                        $rootScope.pages.network.icon.page = 'fa-home';
                    }

                    // $rootScope.pages.network.text = 'Logged in as {{userName}}';

                    if($rootScope.currentPage === 'network')
                        document.title = network;
                    $rootScope.$apply();
                    
                    var width = getTextWidth(network, 'bold 30px "Helvetica Neue",Helvetica,Arial,sans-serif');
                    var offset = 200;
					if(width > $('.navbar').width() - offset) {
                        var start = 30;
                        while(true) {
                            var width = getTextWidth(network, 'bold ' + start + 'px Candara, Calibri, Segoe, "Segoe UI", Optima, Arial, sans-serif');
							if(width < $('.navbar').width() - offset) {
								$('.navbar-brand span').css('font-size', start + 'px')
								break;
							}
							//$('.navbar-brand span').css('font-size', start + 'px').text(width);
							start -= 1;
						}
                        
                    }
                });

                socket.on('user', function(user) {
                    $rootScope.userName = user;
					$rootScope.pages.network.text = 'Logged in as ' + user;
                    $rootScope.$apply();
                });

				$rootScope.wsocket = socket;
                $rootScope.$broadcast('socket', socket);
            };

            $rootScope.showSlideMenu = function() {
                $('#slideout-menu').trigger('open.mm');
            }

            $rootScope.changePageByPos = function(pagePos) {
                for(key in $rootScope.pages) {
                    var page = $rootScope.pages[key];

                    if(page.pos === pagePos) {
                        $rootScope.changePage(key);
                        break;
                    }
                }
            }

            $rootScope.changePage = function(name) {
                $('#slideout-menu').trigger('close.mm');
                switch(name){
                    case 'checkins':
                        $('#checkinsModal').modal('show');
                        break;
                    case 'notifications':
                        $("#notificationsModal").modal('show');
                        break;
                    default:
                        $rootScope.currentPage = name;
                        document.title = $rootScope.pages[name].text;
                        break;
                }
            }

            var includeCounter = 1;
            $rootScope.$on('$includeContentLoaded', function() {
                if(includeCounter == $('.nginclude').length) {
                    if($rootScope.url === null || $rootScope.code === null) {
                        document.title = 'Setup';
                        $('#setupModal').on('shown.bs.modal', function() {
                            $(this).find('input:first').focus();
                        });
                        $('#setupModal').modal('show');
                    } else  {
						if(typeof Android !== 'undefined')
							Android.registerGCM($rootScope.code);
                        setTimeout(function() {
                            $rootScope.ioConnect();
                        }, 1000);
                    }
                } else
                    includeCounter++;
            });

            $("#slideout-menu").mmenu({
                classes: "mm-light",
                counters        : true,
                header          : {
                    add     : true,
                    update  : true,
                    title   : 'School Alert Navigation'
                }
            }).on( "opening.mm", function() {
                $("#currentPage, #statuses").hide();
            }).on( "closing.mm", function() {
                $("#currentPage, #statuses").fadeIn('fast');
            });

           //  document.oncontextmenu = function() { return false }
        }).filter('objectToArray', function() {
            return function(input) {
                var out = []; 
                for(i in input){
                    out.push(input[i]);
                }
             return out;
            }
        });

    app.controller('SetupController', ['$rootScope', '$scope', function($rootScope, $scope) {
        $scope.url = $rootScope.url;
        $scope.code = $rootScope.code;

        // Save the settings to local storage

        $scope.completeSetup = function() {
			if(typeof Android !== 'undefined')
				Android.registerGCM($scope.code);
            localStorage.setItem('siteUrl', $scope.url);
            localStorage.setItem('deviceHash', $scope.code);
            $rootScope.url = $scope.url;
            $rootScope.code = $scope.code;
            location.reload();
        };
        
    }])

    .controller('SettingsController', ['$rootScope', '$scope', function($rootScope, $scope) {
        $scope.newUrl = $rootScope.url;
        $scope.newCode = $rootScope.code;
        $scope.newCompactView = $rootScope.compactView;
        $scope.newPlaySounds = $rootScope.playSounds;

        
        $rootScope.$on('socket', function(event, socket) {
            $("#settingsPage button").prop('disabled', false);
            
            socket.on('test_connection', function(valid) {
                if(valid)
                    $.jGrowl('The connection test was successfull!', {header: 'Connection Test'});
                else
                    $.jGrowl('Invalid connection settings!', {header: 'Connection Test', theme: 'growl-error'});
                $("#settingsPage button").prop('disabled', false);
            });
        });
        
        $scope.applySettings = function() {
			if(typeof Android !== 'undefined')
				Android.registerGCM($scope.newCode);
            $rootScope.url = $scope.newUrl;
            $rootScope.code = $scope.newCode;
            $rootScope.compactView = $scope.newCompactView;
            $rootScope.playSounds = $scope.playSounds;
            localStorage.setItem('siteUrl', $rootScope.url);
            localStorage.setItem('deviceHash', $rootScope.code);
            localStorage.setItem('compactView', $scope.newCompactView);
            localStorage.setItem('playSounds', $scope.newPlaySounds);
            location.reload();
        }

        $scope.testConnection = function() {
            $("#settingsPage button").prop('disabled', true);
            var tsocket = io('http://alertsrv.com:4000', {'force new connection': true, query: 'authCode=' + $scope.newCode + '&authUrl=' + $scope.newUrl});
            tsocket.on('error', function() {
                $.jGrowl('Invalid connection settings!', {header: 'Connection Test', theme: 'growl-error'});
               $("#settingsPage button").prop('disabled', false);
 
            });
            
            tsocket.on('connect', function() {
                console.log('connection');
                $.jGrowl('The connection test was successfull!', {header: 'Connection Test'});
                $("#settingsPage button").prop('disabled', false);
                tsocket.disconnect();
            });
            // $rootScope.testConnection($scope.newUrl, $scope.newCode);
            
            /*
            $.get($scope.newUrl + '/API/v1/init', {auth: $scope.newCode}, function(res) {
                //$.jGrowl('The connection test was successfull!', {header: 'Connection Test'});
            }).error(function() {
                //$.jGrowl('Invalid connection settings!', {header: 'Connection Test', theme: 'growl-error'});
            }).always(function() {
                $("#settingsPage button").prop('disabled', false);
            });*/
        }
    }])

    .controller('NetworkController', ['$rootScope', '$scope', function($rootScope, $scope) {
        $scope.sites = [];
        $scope.siteTypes = {
            elementary: {name:'Elementary School'},
            middle: {name:'Middle School'},
            junior: {name:'Junior High School'},
            high: {name:'High School'},
            alternative: {name: 'Alternative School'},
            other: {name: 'Other'}
        };
        $scope.compact = $rootScope.compactView;
        $scope.colorToClass = {
            green: 'btn-success', 'blue': 'btn-info', 'orange': 'btn-warning', 'red': 'btn-danger'
        };
        $scope.activeType = null;

		$rootScope.getType = function() {
			return $scope.activeType;
		}
		
        $rootScope.setType = function(type) {

        }
        $scope.setType = $rootScope.setType;
		$scope.updateTypes = function() {
			for(i in $scope.siteTypes)
				$scope.siteTypes[i].count = 0;
			
			$scope.sites.forEach(function(site) {
                    if($scope.siteTypes[site.type]) {
                        $scope.siteTypes[site.type].count = $scope.siteTypes[site.type].count ? $scope.siteTypes[site.type].count + 1 : 1;
                    }
			});
		}
		
        $rootScope.$on('socket', function(event, socket) {
			socket.on('connect', function() {
				$scope.activeType = null;
				$scope.sites = [];
                $scope.$apply();
			});
			
			socket.on('deleted_button', function(deleted) {
                outerLoop: for(i in deleted) {
                    for(j in $scope.sites) {
                        for(k in $scope.sites[j].buttons) {
                            if($scope.sites[j].buttons[k].id == deleted[i]) {
                                $scope.sites[j].buttons.splice(k, 1);
                                break outerLoop;
                            }
                        }

                    }
                }

                $scope.$apply();
			});
			
			socket.on('sites', function(updates) {
				updateLoop: for(i in updates.buttons) {
					for(j in $scope.sites) {
						if($scope.sites[j].id == i) {
							for(k in $scope.sites[j].buttons) {
								if($scope.sites[j].buttons[k].id == updates.buttons[i].id) {
									for(l in updates.buttons[i]) {
										if(l == 'id') continue;
										$scope.sites[j].buttons[k][l] = updates.buttons[i][l];
									}
									continue updateLoop;
								}
							}
							
							$scope.sites[j].buttons.push(updates.buttons[i]);
						}
					}
				}
				
				updateLoop: for(i in updates.sites) {
					for(j in $scope.sites) {
						if($scope.sites[j].id == i) {
							for(k in updates.sites[i]) {
								$scope.sites[j][k] = updates.sites[i][k];
							}
							
							continue updateLoop;
						}
					}
					$scope.sites.push(updates.sites[i]);
				}
				
				$scope.updateTypes();
				$scope.$apply();
			});
        });

	
    }])

    .controller('SiteTypeController', ['$rootScope', '$scope', function($rootScope, $scope) {
        this.hidden = $rootScope.compactView;
        this.toggleHidden = function() {
            this.hidden = !this.hidden;
        }
    }])

    .controller('SiteController', ['$rootScope', '$scope', function($rootScope, $scope) {
        this.showConfirmation = false;
        this.fireButton = null;
        this.fireSite = null;
        this.hidden = $rootScope.compactView;


        this.isHidden = function(id) {
            return this.hidden = localStorage['state:s' + id] === 'true';
        };

        this.confirmEvent = function(site, button) {
            this.showConfirmation = true;
            this.fireButton = button;
            this.fireSite = site;
        }

        this.noConfirmation = function() {
            this.showConfirmation = false;
        }

        this.toggleHidden = function(id) {
            this.hidden = !this.hidden;
            localStorage.setItem('state:s' + id, this.hidden);
            $rootScope.$apply();
        }

        this.fireEvent = function(button) {
            var self = this;
            button.disabled = true;
            tmDelay = setTimeout(function() {
                $(button).parent().parent().find('.alert').show();
            }, 2000);

            $rootScope.sendPost({
                url: $rootScope.url + "/API/v1/event",     
                site: this.fireSite.id,
                auth: $rootScope.code,
                id: this.fireButton.id
            });
            button.disabled = false;
            self.showConfirmation = false;
            clearTimeout(tmDelay);
            $(button).parent().parent().find('.alert').hide();
            $.jGrowl('Your event has been successfully created.', {header: 'Event Sent!', theme: 'growl-success'});
			
			/*
            $.post($rootScope.url + "/API/v1/event", {
                site: this.fireSite.id,
                auth: $rootScope.code,
                id: this.fireButton.id
            }).always(function() {
                button.disabled = false;
                self.showConfirmation = false;
                clearTimeout(tmDelay);
                $(button).parent().parent().find('.alert').hide();
                //$.jGrowl('Your event has been successfully created.', {header: 'Event Sent!', theme: 'growl-success'});
                $scope.$apply();
            });*/
        }
    }])

    .controller('NotificationsController', [ '$rootScope', '$scope', function($rootScope, $scope) {
        $scope.selectedIndex = -1;

        $scope.setSelected = function(idx) {
            $scope.selectedIndex = idx;
            $scope.$apply();
        }

        $scope.delete = function(button, index) {
            if(!$rootScope.notifications[index])
                return;

            $(button).prop('disabled', true).redraw()
                .parent().text('').addClass('fa fa-spinner fa-spin');

            $rootScope.sendPost({
              url: $rootScope.url + '/API/v1/notifications',
              auth: $rootScope.code,
              id: $rootScope.notifications[index].id
            });
            //jQuery.post($rootScope.url + '/API/v1/notifications', {auth: $rootScope.code, id: $rootScope.notifications[index].id})
            //.success(function() {
              $scope.selectedIndex = -1;
               // $rootScope.$apply();
                $('#notificationsModal div').redraw();
                SND_NEXT.play();
            //});
        }

        $rootScope.$on('socket', function(event, socket) {
            socket.on('connect', function() {
                $rootScope.notifications = [];
            });

            socket.on('deleted_notifications', function(updates) {
                updates.forEach(function(update) {
                    for(i in $rootScope.notifications) {
                        if($rootScope.notifications[i].id === update) {
                            $rootScope.notifications.splice(i, 1);
                            break;
                        }
                    }
                });

                $rootScope.$apply();
                if($rootScope.notifications.length === 0) {
                    $("#notificationsModal").modal('hide');
                }
            });

            socket.on('notifications', function(updates) {
                updates.forEach(function(update) {
                    $rootScope.notifications.unshift(update);
                });

                if(updates.length) {
                    clearTimeout($rootScope.tmNotif);
                    $rootScope.tmNotif = setTimeout(function() {
                        //$.jGrowl(updates[0].message + (updates.length > 1 ? ' (' + (updates.length - 1) + ' more notification' + ((updates.length - 1) === 1 ? '' : 's') + ')' : ''), {header: 'Notification Alert!'});
                        if($rootScope.playSounds) {
                            clearTimeout(SND_NOTIF.playTimeout);
                            SND_NOTIF.playTimeout = setTimeout(function() {
                                SND_NOTIF.play();
                            }, 500);
                        }
                    }, 2500);
                    
                    alert();
                    $rootScope.$apply();
                }
            });
        });
    }])

    .controller('CheckinsController', [ '$rootScope', '$scope', function($rootScope, $scope) {
        $scope.activeIndex = 0;
        $scope.message = '';
        $scope.locations = [];
        $scope.location = '';
        $scope.status = '-';
        $scope.statusToClass = {
            '-': 'primary',
            safe: 'success',
            'mild-risk': 'warning',
            danger: 'danger'
        };

        $scope.sendResponse = function(button) {
            if(!$rootScope.checkins[$scope.activeIndex]) {
                $scope.activeIndex = $rootScope.checkins.length - 1;
            }

            $(button).prop('disabled', true).find('i').removeClass('fa-comments')
                .addClass('fa-spinner fa-spin').redraw();
            $(button).redraw();
            $rootScope.sendPost({
                url: $rootScope.url + "/API/v1/checkin",     
                auth: $rootScope.code,
                message: $scope.message,
                location: $scope.location,
                status: $scope.status,
                id: $rootScope.checkins[$scope.activeIndex].id
            });
            $('#checkinsModal').find('.active').removeClass('active');
            $.jGrowl('Your response has been sent!', {header: 'Message Sent!', theme: 'growl-success'});
            $(button).prop('disabled', false).find('i').addClass('fa-comments')
                .removeClass('fa-spinner fa-spin').redraw();
            $(button).redraw();
            SND_NEXT.play();

            $scope.message = '';
            $scope.location = '';
            $scope.status = '-';
        }

        $scope.showCheckin = function(idx) {
            $scope.activeIndex = idx;
            $scope.$apply();
        }

        $rootScope.$watchCollection('checkins', function(checkins, old) {
            if(checkins.length > 0 && !checkins[$scope.activeIndex]) {
                $scope.activeIndex = checkins.length - 1;
            }
        });

        $rootScope.$on('socket', function(event, socket) {
            socket.on('connect', function() {
                $rootScope.checkins = [];
            });

            socket.on('checkin', function(updates) {
                updates.forEach(function(update) {
                    $rootScope.checkins.unshift(update);
                });

                if(updates.length) {
                    //$.jGrowl('You have ' + $rootScope.checkins.length + ' checkin' + ($rootScope.checkins.length === 1 ? '' : 's') + ' which need responding!', {header: 'Attention!'});
                    if($rootScope.playSounds) {
                        clearTimeout(SND_CHECK_IN.playTimeout);
                        SND_CHECK_IN.playTimeout = setTimeout(function() {
                            SND_CHECK_IN.play();
                        }, 500);
                    }
                    alert();
                    $('#checkinsModal').modal('show');
                    $rootScope.$apply();
                }
            });

            socket.on('deleted_checkin', function(updates) {
                updates.forEach(function(update) {
                    for(i in $rootScope.checkins) {
                        if($rootScope.checkins[i].id === update) {
                            $rootScope.checkins.splice(i, 1);
                            break;
                        }
                    }
                });

                $rootScope.$apply();
                if($rootScope.checkins.length === 0) {
                    $("#checkinsModal").modal('hide');
                }
            });

            socket.on('locations', function(locations) {
				if($scope.locations.length == 0) {
					$scope.locations = locations;
					$scope.$apply();
					$('#checkinsModal .combobox').combobox({bsVersion: '3'});
				}
            });
        });

        $.get($rootScope.url + '/API/v1/locations', {auth: $rootScope.code})
            .success(function(data) {
                $scope.locations = data.locations;
                $scope.$apply();

                $('#checkinsModal .combobox').combobox({bsVersion: '3'});
        });

        $("#checkinsModal").on('shown.bs.modal', function() {
            $(this).find('[name=message]').focus();
                setTimeout(function() {
                    $rootScope.setType($rootScope.getType());
                }, 500);
        });

        $("#checkinsModal").on('show.bs.modal', function() {

            $(this).find('input').val('');
            $(this).find('.active').removeClass('active');
            $scope.status = '-';
            $scope.location = '';
            $scope.message = '';
        });
        
        setInterval(function() {
            $("#checkinsModal div, input, .caret").redraw();
        }, 100);
    }]);
})(jQuery);