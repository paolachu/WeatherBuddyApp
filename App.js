import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Button, StyleSheet, ActivityIndicator, View, Image, ImageBackground } from 'react-native';
import axios from 'axios';
import * as Location from 'expo-location';
import { Input, Button as RNEButton, Card } from 'react-native-elements';
import { StatusBar } from 'react-native';

// Substitua com a sua chave API
const API_KEY = '7b816ba7fcd5f6a5ad2baa2718d3b204';

// URL base para ícones de clima
const ICON_URL = 'http://openweathermap.org/img/wn/';

export default function App() {
  const [city, setCity] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const getWeather = async (latitude, longitude, cityName) => {
    try {
      setError('');
      setLoading(true);
      let url = '';
      if (latitude && longitude) {
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt`;
      } else {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt`;
      }
      const response = await axios.get(url);
      setCurrentWeather(response.data);

      const forecastUrl = latitude && longitude 
        ? `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=pt` 
        : `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric&lang=pt`;
      
      const forecastResponse = await axios.get(forecastUrl);
      setForecast(forecastResponse.data);
    } catch (err) {
      setError('Não foi possível obter os dados do clima');
      setCurrentWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão para acessar localização negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      getWeather(location.coords.latitude, location.coords.longitude, '');
    } catch (err) {
      setError('Não foi possível obter a localização');
      setCurrentWeather(null);
      setForecast(null);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const isDayTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    const hours = date.getUTCHours(); // Hora em UTC
    return hours >= 6 && hours < 18; // Considerando que o dia é entre 6h e 18h
  };

  const getBackgroundImageUrl = () => {
    if (!forecast) {
      return 'https://images.unsplash.com/photo-1598300057104-2f7cb032e1fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fHN1bm55JTIwc2t5fGVufDB8fHx8MTY1NzAyMDIzMw&ixlib=rb-1.2.1&q=80&w=1080'; // Imagem padrão
    }
    
    // Usando a hora do primeiro item da previsão para determinar o dia/noite
    const firstForecastTime = forecast.list[0].dt;
    const weather = forecast.list[0].weather[0].main.toLowerCase(); // Condição do primeiro item
    
    const dayTime = isDayTime(firstForecastTime);

    // Condições para o dia
    if (dayTime) {
      if (weather.includes('clear')) {
        return 'https://i.pinimg.com/control/564x/f7/fa/80/f7fa8053bd5466f60c9477ce76d7a05b.jpg'; // Ensolarado - Dia
      }
      if (weather.includes('clouds')) {
        return 'https://i.pinimg.com/736x/24/fe/ce/24fece99bcb11c35f01f8aaeeed109d8.jpg'; // Nublado - Dia
      }
      if (weather.includes('rain')) {
        return 'https://i.pinimg.com/originals/26/d5/d6/26d5d68539c381d8e7604b3ec95929b2.gif'; // Chuva - Dia
      }
      if (weather.includes('thunderstorm')) {
        return 'https://i.pinimg.com/originals/75/96/16/759616df82131ee22adc01d6ded46044.gif'; // Tempestade - Dia
      }
      if (weather.includes('snow')) {
        return 'https://i.pinimg.com/originals/7a/a7/68/7aa768c61c7f5552f4e56cb6ae5e6f66.gif'; // Neve - Dia
      }
    } else {
      // Condições para a noite
      if (weather.includes('clear')) {
        return 'https://i.pinimg.com/originals/8f/01/8b/8f018b8414ad46b6ef32bbff605d919b.gif'; // Ensolarado - Noite
      }
      if (weather.includes('clouds')) {
        return 'https://i.pinimg.com/originals/8a/9d/64/8a9d64dbed7ddcbe09b5e91b5113873f.gif'; // Nublado - Noite
      }
      if (weather.includes('rain')) {
        return 'https://i.pinimg.com/originals/c8/d3/69/c8d3699d09824df0f4e17c8f923ca9db.gif'; // Chuva - Noite
      }
      if (weather.includes('thunderstorm')) {
        return 'https://i.pinimg.com/originals/09/12/34/09123493f0ae746891c9eca0acd98075.gif'; // Tempestade - Noite
      }
      if (weather.includes('snow')) {
        return 'https://i.pinimg.com/236x/cb/88/39/cb8839ef3a5f923fab89968a5d37e3c2.jpg'; // Neve - Noite
      }
    }
    
    // Imagem padrão para qualquer outra condição
    return 'https://images.unsplash.com/photo-1598300057104-2f7cb032e1fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fHN1bm55JTIwc2t5fGVufDB8fHx8MTY1NzAyMDIzMw&ixlib=rb-1.2.1&q=80&w=1080'; 
  };

  return (
    <ImageBackground source={{ uri: getBackgroundImageUrl() }} style={styles.background}>
<StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
<ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.title}>
    Weather{'\n'}Buddy
  </Text>
  
  <View style={styles.searchContainer}>
    <Input
      placeholder='Buscar cidade...'
      value={city}
      onChangeText={setCity}
      containerStyle={styles.input}
      inputStyle={styles.inputText}
      placeholderTextColor="#666"
      leftIcon={{ 
        type: 'feather', 
        name: 'search', 
        color: '#666',
        size: 20 
      }}
      autoCapitalize="words"
      returnKeyType="search"
      onSubmitEditing={() => getWeather(null, null, city)}
    />
    
    <View style={styles.buttonsContainer}>
      <RNEButton
        title='Buscar Clima'
        onPress={() => getWeather(null, null, city)}
        buttonStyle={styles.button}
        titleStyle={styles.buttonText}
        icon={{
          name: 'cloud',
          type: 'feather',
          size: 20,
          color: 'white',
        }}
        iconRight
      />
      
      <RNEButton
        title='Usar Localização Atual'
        onPress={getCurrentLocation}
        buttonStyle={[styles.button, styles.locationButton]}
        titleStyle={styles.buttonText}
        icon={{
          name: 'map-pin',
          type: 'feather',
          size: 20,
          color: 'white',
        }}
        iconRight
      />
    </View>
  </View>
        
{loading ? (
  <ActivityIndicator size="large" color="#00aaff" style={styles.loader} />
) : error ? (
  <Text style={styles.error}>{error}</Text>
) : currentWeather ? (
  <Card containerStyle={styles.card}>
    <Card.Title style={styles.cardTitle}>{currentWeather.name}</Card.Title>
    <Card.Divider />
    <View style={styles.weatherInfo}>
      <Image
        source={{ uri: `${ICON_URL}${currentWeather.weather[0].icon}@4x.png` }}
        style={styles.weatherIcon}
      />
      <Text style={styles.temperature}>{Math.round(currentWeather.main.temp)}°C</Text>
    </View>
    <Text style={styles.description}>{currentWeather.weather[0].description}</Text>
    
    <View style={styles.additionalInfoContainer}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Umidade</Text>
          <Text style={styles.infoValue}>{currentWeather.main.humidity}%</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Sensação</Text>
          <Text style={styles.infoValue}>{Math.round(currentWeather.main.feels_like)}°C</Text>
        </View>
      </View>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Mínima</Text>
          <Text style={styles.infoValue}>{Math.round(currentWeather.main.temp_min)}°C</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Máxima</Text>
          <Text style={styles.infoValue}>{Math.round(currentWeather.main.temp_max)}°C</Text>
        </View>
      </View>
    </View>
  </Card>
) : null}

{forecast && (
  <View style={styles.forecastContainer}>
    <Text style={styles.forecastTitle}>Previsão para as Próximas Horas</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScrollContent}>
      {forecast.list.slice(0, 8).map((item, index) => (
        <Card key={index} containerStyle={styles.forecastCard}>
          <Text style={styles.forecastTime}>
            {new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <View style={styles.forecastIconContainer}>
            <Image
              source={{ uri: `${ICON_URL}${item.weather[0].icon}@2x.png` }}
              style={styles.forecastIcon}
            />
          </View>
          <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
          <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
          <View style={styles.forecastDetails}>
            <Text style={styles.forecastDetailText}>Umidade: {item.main.humidity}%</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  </View>
)}

{forecast && (
  <View style={styles.forecastContainer}>
    <Text style={styles.forecastTitle}>Previsão para os Próximos Dias</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.forecastScrollContent}>
      {forecast.list.reduce((acc, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!acc.some(forecastItem => new Date(forecastItem.dt * 1000).toLocaleDateString() === date)) {
          acc.push(item);
        }
        return acc;
      }, []).map((item, index) => (
        <Card key={index} containerStyle={styles.forecastCard}>
          <Text style={styles.forecastDate}>
            {new Date(item.dt * 1000).toLocaleDateString([], {
              weekday: 'short',
              day: '2-digit',
              month: 'short'
            })}
          </Text>
          <View style={styles.forecastIconContainer}>
            <Image
              source={{ uri: `${ICON_URL}${item.weather[0].icon}@2x.png` }}
              style={styles.forecastIcon}
            />
          </View>
          <Text style={styles.forecastTemp}>{Math.round(item.main.temp)}°C</Text>
          <Text style={styles.forecastDesc}>{item.weather[0].description}</Text>
          <View style={styles.forecastDetails}>
            <Text style={styles.forecastDetailText}>Min: {Math.round(item.main.temp_min)}°C</Text>
            <Text style={styles.forecastDetailText}>Max: {Math.round(item.main.temp_max)}°C</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  </View>
)}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({



  background: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 25,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  searchContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 15,
    marginBottom: 25,
    backdropFilter: 'blur(10px)',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  inputText: {
    color: '#2c3e50',
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 10,
  },
  button: {
    backgroundColor: '#1A3D6C',
    paddingVertical: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationButton: {
    backgroundColor: '#1E8449',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    marginTop: 20,
  },
  error: {
    color: '#ff0000',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 10,
    borderWidth: 0,  // Remove a borda padrão
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    width: '90%',  // Ocupa 90% da largura da tela
    alignSelf: 'center',  // Centraliza o card
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 15,
  },
  weatherInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  weatherIcon: {
    width: 80,  
    height: 80,  
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 20,
  },
  description: {
    textAlign: 'center',
    fontSize: 18,
    color: '#34495e',
    marginTop: 15,
    textTransform: 'capitalize',  // Primeira letra maiúscula
  },
  additionalInfo: {
    textAlign: 'center',
    marginVertical: 5,
  },
  forecastContainer: {
    marginTop: 25,
    marginBottom: 10,
  },
  forecastTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  forecastScrollContent: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // Garante que os itens fiquem em uma única linha
    justifyContent: 'center', // Centraliza os cards em telas grandes
    alignItems: 'flex-start', // Evita que perca a navegabilidade em telas menores
    paddingHorizontal: 10,
    minWidth: '100%', // Garante que o conteúdo ocupe pelo menos a largura total
  },
  forecastCard: {
    width: 150, // Mantém a largura consistente
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center', // Centraliza horizontalmente o conteúdo
    justifyContent: 'space-between', // Distribui o conteúdo verticalmente
    minHeight: 200, // Garante altura uniforme para todos os cards
  },
  forecastTime: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
  },
  forecastDate: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  forecastIconContainer: {
    alignItems: 'center',
    marginVertical: 5,
  },
  forecastIcon: {
    width: 60,
    height: 60,
  },
  forecastTemp: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2c3e50',
    marginVertical: 5,
  },
  forecastDesc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#34495e',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  forecastDetails: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 8,
    marginTop: 5,
  },
  forecastDetailText: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
    marginVertical: 2,
  },
  additionalInfoContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 15,
},
infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 5,
},
infoItem: {
    alignItems: 'center',
},
infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
},
infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
},
});
