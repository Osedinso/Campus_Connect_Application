import {
  SafeAreaView,
  Image,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,

} from "react-native";
import React, { useState } from "react";
import {Link} from "expo-router"

const App = ({ navigation }) => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    
  });
 return(
   
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/complete.png")}
          style={styles.headerImg}
          alt="Logo"
        />
        <Text style={styles.title}>Omini App</Text>
        <Text style={styles.subtitle}>
          Let's come together to share experiences
        </Text>
      </View>
      <View style={styles.form}>
        <View style={styles.input}>
          {/* <Text style={styles.inputLabel}>Email Address</Text> */}
          <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
            style={styles.inputControl}
            value={form.email}
            placeholder="Username/Email"
            onChangeText={(email) => setForm({ ...form, email })}
          />
        </View>
        <View style={styles.input}>
          {/* <Text style={styles.inputLabel}>Password</Text> */}
          <TextInput
            secureTextEntry
            style={styles.inputControl}
            value={form.password}
            placeholder="Password"
            onChangeText={(password) => setForm({ ...form, password })}
          />
        </View>
        <Text style={{textAlign: "right", color:"#075eec"}}>Forget Password?</Text>
        
        <TouchableOpacity style={{marginTop: 'auto'}}
        onPress={() => {
          //handle on press
          
        }}>
          <Text style={styles.formfooter}>Dont have an account? 
            <Text style={{color:'#075eec'}}> Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <View style={styles.formAction}>
          <TouchableOpacity onPress={() => {
            //Handel on press action
            navigation.navigate('Dashboard');
          }}>
            <View style={styles.btn}>
              <Text style={styles.btnText}>Log in</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </SafeAreaView>
  );
};

export default App;
const styles = StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  header: {
    marginVertical: 36,
  },
  headerImg: {
    width: 120,
    height: 120,
    alignSelf: "center",
  },
  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "black",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
    marginTop: 12
  },
  input: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputControl: {
    height: 54,
    backgroundColor: "#fff",
    paddingVertical: 0,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderStyle:  'solid',
    borderWidth: 2,
    borderColor: '#B2ACAC',
    fontSize: 15,
    fontWeight: "500",
    marginTop: 23,
  },
  form:{
    marginTop:54,
    flex: 1
  },
  formAction:{
    marginVertical: 24
  },
  formfooter:{
    textAlign: 'center',
  },
  btn:{
    backgroundColor: '#075eec',
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  btnText:{
    fontSize: 18,
    fontWeight: '600',
    color: '#fff'
  }
});
