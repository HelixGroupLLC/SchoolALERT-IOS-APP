#import "StaticCock.h"
static NSString* str;

@implementation StaticCock

+ (NSString*)str {
    return str;
}

+ (void)setStr:(NSString*)newStr {
    if (str != newStr) {
        //[str release];
        str = [newStr copy];
    }
}
@end