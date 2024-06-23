import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Alert,
    Image
  } from "react-native";
  import React from "react";
  
  
  const App = ({ navigation }) => {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        
        <View style={styles.container}>
        <Image
            source={require("../assets/McneeseLogo.png")}
            style={styles.headerImg}
            alt="Logo"
          />
          <Text style={styles.intro}>Mcneese Easy Connect</Text>
        </View>
        <View>
          <View style={styles.btn_container}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('signup');
              }}
            >
              <View style={styles.btn}>
                <Text style={styles.btnText}>Get Started</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.btn_container}>
            <TouchableOpacity
              onPress={() => {
                //Handel on press action
                navigation.navigate('Login');
              }}
            >
              <View style={styles.btn}>
                <Text style={styles.btnText}>I already have an account </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.terms_container}>
            <Text class="text-2xl">
              Your privacy is our concern and we want you to know how we process
              your personal information. By continuing yuo confirm that you've
              read and accepted out Terms and Privacy Policy
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  export default App;
  
  const styles = StyleSheet.create({
    container: {
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
    },
    headerImg:{
      alignSelf: "center",
      marginTop: 30,
      width: 120,
      height: 120,
    },
    intro: {
      fontSize: 40,
      fontWeight: "700",
      textAlign: "center",
    },
    btn: {
      backgroundColor: "#075eec",
      borderRadius: 29,
      width: 350,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    btnText: {
      fontSize: 18,
      fontWeight: "600",
      color: "#fff",
    },
    terms: {
      textAlign: "center",
      justifyContent: "center",
      marginTop: 10,
      marginBottom: 30,
      fontSize: 12,
      width: 320,
      lineHeight: 15,
    },
    btn_container: {
      alignItems: "center",
    },
    terms_container: {
      alignItems: "center",
    },
  });
  