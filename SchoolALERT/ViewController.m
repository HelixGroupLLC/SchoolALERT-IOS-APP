//
//  ViewController.m
//  SchoolALERT
//
//  Created by Helix Group on 9/16/14.
//  Copyright (c) 2014 christopher@helixgroup.net. All rights reserved.
//

#import "ViewController.h"
#import "WebViewJavascriptBridge.h"
#import "MyManager.h"
@interface ViewController ()

@end

@implementation ViewController
//static NSString *transferRegistration = Nil;
/*(- (BOOL)myWebView:(UIWebView *)webView shouldStartLoadWithRequest:(NSURLRequest *)request
 navigationType:(UIWebViewNavigationType)navigationType {
    NSString *urlString = [[request URL] absoluteString];
    
    if ([urlString hasPrefix:@"js:"]) {
        NSLog(@"TESOTKDOFKSDF");
    }
    
    
    NSLog(@"EODKSOKDSFSOK");
    
    return NO;
}*/

//-  (void)passDeviceToken:(NSData *)deviceToken {
 //   NSLog(@"ASDOKASODKASD");
   // ;// NSLog(@"'%@' test bitch swag bitch", token);
//}


- (void)passDeviceToken:(NSString *)token;
{
   [[self myWebView] stringByEvaluatingJavaScriptFromString:
                       [NSString stringWithFormat:@"window.appId = '%@';", token]];
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    MyManager *sharedManager = [MyManager sharedManager];
    [sharedManager setViewController:self];
    
    NSURL *url = [NSURL fileURLWithPath:[[NSBundle mainBundle] pathForResource:@"client" ofType:@"html" inDirectory:@"www"]];
    
    UIWebView *myWebView = [[UIWebView alloc] initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height)];
    [self setMyWebView:myWebView];
    [self.view addSubview:myWebView];
    
    [WebViewJavascriptBridge enableLogging];
    //localStorage['deviceHash']
    
    //[myWebView loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:@"index.html"]]];
   //NSString *returnvalue = [myWebView stringByEvaluatingJavaScriptFromString:@"alert('test')"];
   //NSLog(@"This is an output message");
    //NSString *result = [myWebView stringByEvaluatingJavaScriptFromString:
    //                    @"function f(){ return \"hello\"; } f();"];
    //NSLog(@"result: '%@'", result); // 'hello'
   
    //NSLog(@"test");
    //NSLog(@"GOT: %@", sharedManager.someProperty);
    
    [myWebView loadRequest:[NSURLRequest requestWithURL:url]];
    [myWebView stringByEvaluatingJavaScriptFromString:@"window.Android = {};"];
    [myWebView stringByEvaluatingJavaScriptFromString:@"window.Android.registerGCM = function(code) { $.post('http://23.253.159.251/pushapi/register.php', {name: code, email: 'email', regId: window.appId, type: 'ios'}, function(res) { }); }"];
    [myWebView stringByEvaluatingJavaScriptFromString:@"window.alert = function() {}"];
    	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
