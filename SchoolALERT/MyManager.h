#import <foundation/Foundation.h>
#import "ViewController.h";

@interface MyManager : NSObject {
    NSString *someProperty;
    
    
}
@property (nonatomic, retain) NSString *someProperty;
@property (nonatomic, retain) ViewController *viewController;

+ (id)sharedManager;
- (void)passDeviceToken:(NSData *)token;
@end