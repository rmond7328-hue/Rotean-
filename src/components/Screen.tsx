import { PropsWithChildren } from 'react';
import { ScrollView,StyleSheet,View } from 'react-native';
import { colors,spacing } from '@/theme/tokens';
export function Screen({children}:PropsWithChildren){return <View style={styles.root}><ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{children}</ScrollView></View>}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:colors.paper},content:{padding:spacing.xl,paddingBottom:spacing.xxxl}});
