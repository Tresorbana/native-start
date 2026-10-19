import React, { useState } from 'react';
import {
  Button,
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

const initialForm = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
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
};

const accountTypes = ['Personal', 'Student', 'Business'];
const interestOptions = ['Sports', 'Music', 'Technology', 'Travel'];

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [showAccountTypes, setShowAccountTypes] = useState(false);

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

  const handleSubmit = () => {
    const { confirmPassword, ...registrationData } = form;
    console.log('Registration data:', registrationData);
    console.log('Passwords match:', form.password === confirmPassword);
  };

  const handleReset = () => {
    setForm({ ...initialForm, interests: [] });
    setShowAccountTypes(false);
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
      {textField('Confirm password', 'confirmPassword', { secureTextEntry: true }, 'password')}
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

      {textField('Country', 'country', { autoCapitalize: 'words' })}

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

      <Button title="Register" onPress={handleSubmit} />
      <Button title="Reset" onPress={handleReset} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 16,
  },
  form: {
    width: '100%',
    maxWidth: 520,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  field: {
    gap: 4,
  },
  label: {
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    minHeight: 38,
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  choice: {
    paddingVertical: 4,
  },
});
