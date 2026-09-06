import { StyleSheet,Text,View } from 'react-native';
import { colors,spacing,typography } from '@/theme/tokens';
export function SectionTitle({eyebrow,title}:{eyebrow?:string;title:string}){return <View style={styles.wrap}>{eyebrow?<Text style={styles.eyebrow}>{eyebrow}</Text>:null}<Text style={styles.title}>{title}</Text></View>}
const styles=StyleSheet.create({wrap:{gap:spacing.xs},eyebrow:{...typography.label,color:colors.green},title:{...typography.h2,color:colors.ink}});
