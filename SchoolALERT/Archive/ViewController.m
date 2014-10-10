//
//  ViewController.m
//  SchoolALERT
//
//  Created by Helix Group on 9/16/14.
//  Copyright (c) 2014 christopher@helixgroup.net. All rights reserved.
//

#import "ViewController.h"

@interface ViewController ()

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"client" ofType:@"html" inDirectory:@"www"]];
    
    UIWebView *myWebView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height)];
    //[myWebView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"index.html"]]];
    
    [myWebView loadRequest:[NSURLRequest requestWithURL:url]];
     NSString *result = [myWebView stringByEvaluatingJavaScriptFromString:@"window._alert = alert;window.alert = function() {ss}"];
    
    
    
    
    [self.view addSubview:myWebView];	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
