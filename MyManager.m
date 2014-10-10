#import "MyManager.h"

@implementation MyManager
static NSData* commonString = @"A value here";
@synthesize someProperty;
@synthesize viewController;

#pragma mark Singleton Methods

+ (id)sharedManager {
    static MyManager *sharedMyManager = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        sharedMyManager = [[self alloc] init];
    });
    return sharedMyManager;
}

- (void)passDeviceToken:(NSString *)token{
    commonString = token;
}


- (id)init {
    if (self = [super init]) {
        someProperty = commonString;
        
    }
    return self;

    
}


- (void)dealloc {
    // Should never be called, but just here for clarity really.
}

@end