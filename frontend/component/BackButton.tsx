import { useNavigation } from '@react-navigation/native';
import { Button } from "react-native-paper";


const CustomBack = () => {
  const navigation = useNavigation();

  return (
    <Button mode="contained" onPress={() => navigation.goBack()} style={{ marginTop: 30 }}>
    ←Back
    </Button>
  );
};


export default CustomBack;