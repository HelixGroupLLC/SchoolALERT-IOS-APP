//
//  ViewController.h
//  SchoolALERT
//
//  Created by Helix Group on 9/16/14.
//  Copyright (c) 2014 christopher@helixgroup.net. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ViewController : UIViewController
@property (assign) UIWebView * myWebView;
- (void)passDeviceToken:(NSString *)token;
@end
