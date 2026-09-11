import {useEffect,useState} from "react";
import {Alert,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import {Screen} from "@/components/Screen";
import {colors,typography} from "@/theme/tokens";
import {listTasks,createTask,updateTask} from "@/services/tasks";

export default function Tasks(){
  const[tasks,setTasks]=useState<any[]>([]);
  const[title,setTitle]=useState("");
  async function load(){try{setTasks(await listTasks())}catch{Alert.alert("Couldn't load tasks","Check your connection and try again.")}}
  useEffect(()=>{load()},[]);
  async function add(){
    if(!title.trim())return;
    try{await createTask({title:title.trim()});setTitle("");load()}
    catch{Alert.alert("Couldn't save","Please try again.")}
  }
  async function done(id:string){
    try{await updateTask(id,{status:"completed"});load()}
    catch{Alert.alert("Couldn't update","Please try again.")}
  }
  return <Screen><Text style={s.eyebrow}>YOUR WORK</Text><Text style={s.title}>Tasks</Text><Text style={s.sub}>Things you want to move forward.</Text><View style={s.add}><TextInput value={title} onChangeText={setTitle} placeholder="Add a task…" placeholderTextColor={colors.inkMuted} style={s.input}/><Pressable onPress={add} style={s.addButton}><Text style={s.addText}>Add</Text></Pressable></View>{tasks.filter(t=>t.status!=="completed"&&t.status!=="cancelled").map(t=><View key={t.id} style={s.row}><Pressable onPress={()=>done(t.id)} style={s.check}><Text>✓</Text></Pressable><View style={s.copy}><Text style={s.task}>{t.title}</Text>{t.estimated_minutes?<Text style={s.meta}>{t.estimated_minutes} min</Text>:null}</View></View>)}{!tasks.filter(t=>t.status!=="completed"&&t.status!=="cancelled").length&&<Text style={s.empty}>No open tasks. That's a good place to be.</Text>}</Screen>
}

const s=StyleSheet.create({eyebrow:{...typography.label,color:colors.green},title:{...typography.h1,color:colors.ink,marginTop:8},sub:{...typography.body,color:colors.inkMuted,marginTop:8},add:{flexDirection:"row",gap:8,marginTop:32},input:{flex:1,height:52,borderWidth:1,borderColor:colors.line,borderRadius:14,paddingHorizontal:14,backgroundColor:colors.surface,color:colors.ink},addButton:{paddingHorizontal:18,borderRadius:14,backgroundColor:colors.green,justifyContent:"center"},addText:{...typography.h3,color:colors.white},row:{flexDirection:"row",alignItems:"center",gap:12,paddingVertical:18,borderBottomWidth:1,borderBottomColor:colors.line},check:{width:28,height:28,borderRadius:14,borderWidth:1,borderColor:colors.green,alignItems:"center",justifyContent:"center"},copy:{flex:1},task:{...typography.body,color:colors.ink},meta:{...typography.bodySmall,color:colors.inkMuted,marginTop:3},empty:{...typography.body,color:colors.inkMuted,marginTop:32}});