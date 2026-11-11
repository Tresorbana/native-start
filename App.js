import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  age: '',
  decimalExample: '',
  date: '',
  dateTime: '',
  month: '',
  week: '',
  time: '',
  website: '',
  search: '',
  favoriteColor: '#000000',
  rangeValue: '50',
  gender: '',
  country: '',
  accountType: '',
  interests: [],
  bio: '',
  receiveUpdates: false,
  acceptTerms: false,
  document: null,
  profilePhoto: null,
};

const accountTypes = ['Personal', 'Student', 'Business'];
const countries = ['Rwanda', 'Kenya', 'Uganda', 'Tanzania', 'United States'];
const interestOptions = ['Sports', 'Music', 'Technology', 'Travel'];

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [showAccountTypes, setShowAccountTypes] = useState(false);
  const [showCountries, setShowCountries] = useState(false);
  const [webCameraStream, setWebCameraStream] = useState(null);
  const [webCameraError, setWebCameraError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    if (webCameraStream && videoRef.current) {
      videoRef.current.srcObject = webCameraStream;
      videoRef.current.play().catch((error) => {
        setWebCameraError(`Could not start camera preview: ${error.message}`);
      });
    }

    return () => {
      webCameraStream?.getTracks().forEach((track) => track.stop());
    };
  }, [webCameraStream]);

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleInterest = (interest) => {
    const interests = form.interests.includes(interest)
      ? form.interests.filter((item) => item !== interest)
      : [...form.interests, interest];
    update('interests', interests);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
      });
      if (!result.canceled) update('document', result.assets[0]);
    } catch (error) {
      console.error('Could not select a document:', error);
    }
  };

  const openCamera = async () => {
    try {
      if (Platform.OS === 'web') {
        if (!navigator.mediaDevices?.getUserMedia) {
          setWebCameraError('This browser does not support camera access.');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        setWebCameraError('');
        setWebCameraStream(stream);
        return;
      }

      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        console.warn('Camera permission was not granted.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) update('profilePhoto', result.assets[0]);
    } catch (error) {
      if (Platform.OS === 'web') {
        setWebCameraError(`Could not open camera: ${error.message}`);
      } else {
        console.error('Could not open camera:', error);
      }
    }
  };

  const closeWebCamera = () => setWebCameraStream(null);

  const captureWebPhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      setWebCameraError('The camera is not ready yet. Try again in a moment.');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((file) => {
      if (!file) {
        setWebCameraError('Could not capture the photo.');
        return;
      }
      const uri = URL.createObjectURL(file);
      update('profilePhoto', {
        uri,
        file,
        name: 'profile-photo.jpg',
        mimeType: file.type,
        width: canvas.width,
        height: canvas.height,
      });
      setWebCameraStream(null);
    }, 'image/jpeg', 0.9);
  };

  const handleSubmit = () => {
    console.log('Registration data:', form);
  };

  const handleReset = () => {
    setForm({ ...initialForm, interests: [] });
    setShowAccountTypes(false);
    setShowCountries(false);
  };

  const textField = (label, field, props = {}, webType) => (
    <View key={field} style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {Platform.OS === 'web' && webType ? (
        React.createElement('input', {
          type: webType,
          value: form[field],
          placeholder: label,
          style: styles.input,
          min: webType === 'range' ? 0 : undefined,
          max: webType === 'range' ? 100 : undefined,
          onChange: (event) => update(field, event.target.value),
        })
      ) : (
        <TextInput
          value={form[field]}
          onChangeText={(value) => update(field, value)}
          placeholder={label}
          style={styles.input}
          {...props}
        />
      )}
    </View>
  );

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.form}>
      <Text style={styles.title}>Registration</Text>

      {textField('First name', 'firstName', { autoCapitalize: 'words' })}
      {textField('Last name', 'lastName', { autoCapitalize: 'words' })}
      {textField('Username', 'username', { autoCapitalize: 'none' })}
      {textField('Email', 'email', { keyboardType: 'email-address', autoCapitalize: 'none' }, 'email')}
      {textField('Password', 'password', { secureTextEntry: true }, 'password')}
      {textField('Phone', 'phone', { keyboardType: 'phone-pad' }, 'tel')}
      {textField('Age (whole number)', 'age', { keyboardType: 'number-pad' }, 'number')}
      {textField('Decimal number', 'decimalExample', { keyboardType: 'decimal-pad' }, 'number')}
      {textField('Date', 'date', {}, 'date')}
      {textField('Date and time', 'dateTime', {}, 'datetime-local')}
      {textField('Month', 'month', {}, 'month')}
      {textField('Week', 'week', {}, 'week')}
      {textField('Time', 'time', {}, 'time')}
      {textField('Website', 'website', { keyboardType: 'url', autoCapitalize: 'none' }, 'url')}
      {textField('Search', 'search', {}, 'search')}
      {textField('Favorite color', 'favoriteColor', {}, 'color')}
      {textField('Range (0-100)', 'rangeValue', { keyboardType: 'numeric' }, 'range')}

      <Text style={styles.label}>Gender (choose one)</Text>
      {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map((option) => (
        <Pressable key={option} style={styles.choice} onPress={() => update('gender', option)}>
          <Text>{form.gender === option ? '(*)' : '( )'} {option}</Text>
        </Pressable>
      ))}

      <Text style={styles.label}>Country</Text>
      <Button
        title={form.country || 'Choose a country'}
        onPress={() => setShowCountries((shown) => !shown)}
      />
      {showCountries && countries.map((country) => (
        <Pressable
          key={country}
          style={styles.choice}
          onPress={() => {
            update('country', country);
            setShowCountries(false);
          }}
        >
          <Text>{form.country === country ? '(*)' : '( )'} {country}</Text>
        </Pressable>
      ))}

      <Text style={styles.label}>Account type (select one)</Text>
      <Button
        title={form.accountType || 'Choose account type'}
        onPress={() => setShowAccountTypes((shown) => !shown)}
      />
      {showAccountTypes && accountTypes.map((option) => (
        <Pressable
          key={option}
          style={styles.choice}
          onPress={() => {
            update('accountType', option);
            setShowAccountTypes(false);
          }}
        >
          <Text>{form.accountType === option ? '(*)' : '( )'} {option}</Text>
        </Pressable>
      ))}

      <Text style={styles.label}>Interests (choose any)</Text>
      {interestOptions.map((option) => (
        <Pressable key={option} style={styles.choice} onPress={() => toggleInterest(option)}>
          <Text>{form.interests.includes(option) ? '[x]' : '[ ]'} {option}</Text>
        </Pressable>
      ))}

      {textField('About you', 'bio', { multiline: true, numberOfLines: 4, textAlignVertical: 'top' })}

      <Text style={styles.label}>Receive product updates</Text>
      <Switch
        value={form.receiveUpdates}
        onValueChange={(value) => update('receiveUpdates', value)}
      />

      <Text style={styles.label}>Accept terms and conditions</Text>
      <Pressable style={styles.choice} onPress={() => update('acceptTerms', !form.acceptTerms)}>
        <Text>{form.acceptTerms ? '[x]' : '[ ]'} I accept the terms</Text>
      </Pressable>

      <Text>Document attachment</Text>
      <Button title="Choose document" onPress={pickDocument} />
      {form.document && <Text>Selected: {form.document.name}</Text>}

      <Text style={styles.label}>Profile photo</Text>
      {Platform.OS === 'web' && webCameraStream && React.createElement('video', {
        ref: videoRef,
        autoPlay: true,
        playsInline: true,
        style: styles.cameraPreview,
      })}
      <Button
        title={Platform.OS === 'web' && webCameraStream ? 'Capture photo' : 'Open camera'}
        onPress={Platform.OS === 'web' && webCameraStream ? captureWebPhoto : openCamera}
      />
      {Platform.OS === 'web' && webCameraStream && (
        <Button title="Close camera" onPress={closeWebCamera} />
      )}
      {webCameraError !== '' && <Text>{webCameraError}</Text>}
      {form.profilePhoto && (
        <Image source={{ uri: form.profilePhoto.uri }} style={styles.photo} />
      )}

      <Button title="Register" onPress={handleSubmit} />
      <Button title="Reset" onPress={handleReset} />
      </View>
    </ScrollView>
  );
};
