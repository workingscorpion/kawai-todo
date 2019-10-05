import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import ToDo from "./ToDo";
import { AppLoading } from "expo";
import uuidv1 from "uuid/v1";

const { height, width } = Dimensions.get("window");

export default class App extends Component {
  state = {
    newToDo: "",
    loadedToDos: false,
    toDos: {}
  };
  componentDidMount = () => {
    // AsyncStorage.removeItem();
    this._loadToDos(); //이 부분을 작성 안해주면 if문이 계속 실행되기 때문에 무한 loop에 빠짐.
  };
  render() {
    const { newToDo, loadedToDos, toDos } = this.state;
    if (!loadedToDos) {
      // AsyncStorage.setItem("toDos", JSON.stringify({}));
      AsyncStorage.setItem("toDos", JSON.stringify(toDos));
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>Kawai To Do</Text>
        <View style={styles.card}>
          <TextInput
            placeholder={"New To Do"}
            placeholderTextColor={"#999"}
            style={styles.input}
            value={newToDo}
            onChangeText={this._controlNewToDo}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
          />
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos)
              .reverse()
              .map(toDo => (
                <ToDo
                  key={toDo.id}
                  deleteToDo={this._deleteToDo}
                  uncompleteToDo={this._uncompleteToDo}
                  completeToDo={this._completeToDo}
                  updateToDo={this._updateToDo}
                  {...toDo}
                />
              ))}
            {/* {Object.values(toDos).map(toDo => (
              <ToDo key={toDo.id} {...toDo} />
            ))} */}
          </ScrollView>
        </View>
      </View>
    );
  }
  _controlNewToDo = text => {
    this.setState({
      newToDo: text
    });
  };

  _loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos"); //wait는 이 함수가 다 실행될때까지 다른 작업은 잠시 기다리라는 의미
      console.log(`AsyncStorage.getItem("toDos") = ` + toDos);
      const parsedToDos = JSON.parse(toDos);
      console.log("JSON.parse(toDos) :", parsedToDos);
      this.setState({ loadedToDos: true, toDos: parsedToDos });
    } catch (err) {
      console.log(err);
    }
  };

  _addToDo = () => {
    const { newToDo } = this.state;
    if (newToDo !== "") {
      this.setState(prevState => {
        // toDos:prevState.toDos+newToDo
        const ID = uuidv1();
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newToDo,
            createdAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newToDo: "",
          toDos: {
            ...prevState.toDos,
            ...newToDoObject
          }
        };
        this._saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  };

  _deleteToDo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _uncompleteToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _completeToDo = id => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  _saveToDos = newToDos => {
    // console.log(JSON.stringify(newToDos));
    // const saveToDos = AsyncStorage.setItem("toDos", newToDos);
    //AsyncStorage는 Object가 아니라 string 저장만을 제공하기 때문에 위와같이 object를 저장하면 crash 발생됨
    //따라서 JSON.stringify를 통해 객체를 string으로 만들어야함
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f23657",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 50,
    fontWeight: "200",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    // borderRadius: 10
    //셰도우를 적용하는 방법은 ios와 안드로이드가 다르기 때문에 platform-specific code를 해얗마
    //ios라면 shadowColor, shadowOffset, shadowOpacity, shadowRadius 사용
    //android는 elevation을 이용 1~5까지 있음
    // elevation:5
    ...Platform.select({
      ios: {
        shadowColor: "rgba(50,50,50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 1,
    fontSize: 25
  },
  toDos: {
    alignItems: "center"
  }
});
