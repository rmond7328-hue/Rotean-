export const colors={ink:'#17201B',inkMuted:'#68736C',paper:'#F7F5EF',surface:'#FFFEFA',surfaceRaised:'#FFFFFF',line:'#E5E2D9',green:'#234D3A',greenDeep:'#173729',lime:'#B8D85B',yellow:'#E9C85B',orange:'#D98A4A',red:'#C75A4D',white:'#FFFFFF'} as const;
export const spacing={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32,xxxl:48} as const;
export const radius={sm:8,md:14,lg:20,pill:999} as const;
export const typography={display:{fontSize:36,lineHeight:40,fontWeight:'700' as const,letterSpacing:-1.2},h1:{fontSize:28,lineHeight:34,fontWeight:'700' as const,letterSpacing:-0.7},h2:{fontSize:22,lineHeight:28,fontWeight:'700' as const,letterSpacing:-0.4},h3:{fontSize:17,lineHeight:23,fontWeight:'700' as const},body:{fontSize:16,lineHeight:23,fontWeight:'400' as const},bodySmall:{fontSize:14,lineHeight:20,fontWeight:'400' as const},label:{fontSize:12,lineHeight:16,fontWeight:'700' as const,letterSpacing:0.3}} as const;
export const theme={colors,spacing,radius,typography};
