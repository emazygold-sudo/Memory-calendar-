import React, { useState, useEffect, useMemo, useCallback, useContext, createContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Modal, Alert, Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView,
  Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ---------- Layout Constants ----------
const TAB_MENU_HEIGHT = Platform.OS === 'web' ? 56 : 49;
const SCROLL_EXTRA_PADDING = 8;
const WEB_TAB_MENU_PADDING = 90;
const FAB_SPACING = 12;

// ---------- Theme ----------
const primaryColor = '#D4A574';
const accentColor = '#B8956A';
const backgroundColor = '#FDF8F3';
const cardColor = '#FFFFFF';
const textPrimary = '#2D1810';
const textSecondary = '#6B5B4D';
const designStyle = 'modern';

// ---------- Theme Context ----------
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const lightTheme = useMemo(() => ({
    colors: {
      primary: primaryColor,
      accent: accentColor,
      background: backgroundColor,
      card: cardColor,
      textPrimary: textPrimary,
      textSecondary: textSecondary,
      border: '#E8DDD4',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    }
  }), []);
  const darkTheme = useMemo(() => ({
    colors: {
      primary: primaryColor,
      accent: accentColor,
      background: '#1F2937',
      card: '#374151',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      border: '#4B5563',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    }
  }), []);
  const theme = darkMode ? darkTheme : lightTheme;
  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const value = useMemo(() => ({ theme, darkMode, toggleDarkMode, designStyle }), [theme, darkMode, toggleDarkMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

const useTheme = () => useContext(ThemeContext);

// ---------- DatePickerInput ----------
const DatePickerInput = (props) => {
  const { value, onChange, placeholder, style } = props;
  const parsed = value ? value.split('-') : null;
  const now = new Date();
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const nowDay = now.getDate();

  const initYear = parsed ? parseInt(parsed[0], 10) : nowYear;
  const initMonth = parsed ? parseInt(parsed[1], 10) : nowMonth;
  const initDay = parsed ? parseInt(parsed[2], 10) : nowDay;

  const [showPicker, setShowPicker] = useState(false);
  const [selYear, setSelYear] = useState(initYear);
  const [selMonth, setSelMonth] = useState(initMonth);
  const [selDay, setSelDay] = useState(initDay);

  useEffect(() => {
    const maxDay = new Date(selYear, selMonth, 0).getDate();
    if (selDay > maxDay) setSelDay(maxDay);
  }, [selYear, selMonth]);

  const pad = (n) => (n < 10 ? '0' + n : String(n));
  const handleConfirm = () => {
    if (onChange) onChange(`${selYear}-${pad(selMonth)}-${pad(selDay)}`);
    setShowPicker(false);
  };

  const displayValue = value ? `${pad(selMonth)}/${pad(selDay)}/${selYear}` : (placeholder || 'Select date');

  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange && onChange(e.target.value)}
        style={{
          padding: 12,
          border: '1px solid #E8DDD4',
          borderRadius: 8,
          fontSize: 16,
          width: '100%',
          boxSizing: 'border-box',
          color: textPrimary,
          backgroundColor: cardColor,
          outline: 'none',
          ...style
        }}
      />
    );
  }

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const years = [];
  for (let y = nowYear - 10; y <= nowYear + 20; y++) years.push(y);
  const daysInMonth = new Date(selYear, selMonth, 0).getDate();
  const days = [];
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const colStyle = { flex: 1, maxHeight: 180 };
  const itemStyle = (active) => ({
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: active ? '#F3EDE7' : 'transparent'
  });
  const itemTextStyle = (active) => ({
    fontSize: 16,
    color: active ? primaryColor : textPrimary,
    fontWeight: active ? 'bold' : 'normal'
  });

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: '#E8DDD4',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: cardColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 4,
          ...style
        }}
      >
        <Text style={{ fontSize: 16, color: value ? textPrimary : textSecondary }}>
          {displayValue}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color={primaryColor} />
      </TouchableOpacity>
      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
          <View style={{
            backgroundColor: cardColor,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 36
          }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: textPrimary }}>
              Select Date
            </Text>
            <View style={{ flexDirection: 'row', borderRadius: 8, overflow: 'hidden' }}>
              <ScrollView style={colStyle} showsVerticalScrollIndicator={false}>
                {MONTHS.map((m, i) => {
                  const active = selMonth === i + 1;
                  return (
                    <TouchableOpacity key={i} onPress={() => setSelMonth(i + 1)} style={itemStyle(active)}>
                      <Text style={itemTextStyle(active)}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <ScrollView style={colStyle} showsVerticalScrollIndicator={false}>
                {days.map(d => {
                  const active = selDay === d;
                  return (
                    <TouchableOpacity key={d} onPress={() => setSelDay(d)} style={itemStyle(active)}>
                      <Text style={itemTextStyle(active)}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <ScrollView style={colStyle} showsVerticalScrollIndicator={false}>
                {years.map(yr => {
                  const active = selYear === yr;
                  return (
                    <TouchableOpacity key={yr} onPress={() => setSelYear(yr)} style={itemStyle(active)}>
                      <Text style={itemTextStyle(active)}>{yr}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{ backgroundColor: primaryColor, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowPicker(false)}
              style={{ padding: 14, alignItems: 'center', marginTop: 4 }}
            >
              <Text style={{ color: textSecondary, fontSize: 16 }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---------- AddEventModal ----------
const AddEventModal = ({ visible, selectedDate, theme, insetsTop, insetsBottom, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState(selectedDate);
  const [attachedMedia, setAttachedMedia] = useState([]);

  // Mock camera functions – replace with actual expo-camera/image-picker if needed
  const takePhoto = () => new Promise(resolve => resolve({ cancelled: false, uri: 'https://via.placeholder.com/150' }));
  const pickImage = () => new Promise(resolve => resolve({ cancelled: false, uri: 'https://via.placeholder.com/150' }));
  const insertEvent = (data) => Promise.resolve({ id: Date.now() });
  const insertMedia = (data) => Promise.resolve();

  const handleTakePhoto = () => {
    takePhoto().then(result => {
      if (!result.cancelled && result.uri) {
        setAttachedMedia(prev => [...prev, { uri: result.uri, type: 'photo' }]);
      }
    });
  };

  const handlePickImage = () => {
    pickImage().then(result => {
      if (!result.cancelled && result.uri) {
        setAttachedMedia(prev => [...prev, { uri: result.uri, type: 'photo' }]);
      }
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an event title');
      return;
    }
    const eventData = { title: title.trim(), description: description.trim(), date: eventDate };
    insertEvent(eventData)
      .then(eventResult => {
        const eventId = eventResult.id;
        const mediaPromises = attachedMedia.map(mediaItem => insertMedia({ uri: mediaItem.uri, type: mediaItem.type, date: eventDate, event_id: eventId }));
        return Promise.all(mediaPromises);
      })
      .then(() => {
        setTitle('');
        setDescription('');
        setAttachedMedia([]);
        onSave();
      })
      .catch(error => {
        Alert.alert('Error', 'Error saving event: ' + error.message);
      });
  };

  const removeMedia = (index) => {
    setAttachedMedia(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : (Platform.OS === 'web' ? undefined : 'height')}>
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', marginTop: insetsTop }}>
          <View style={{
            flex: 1,
            maxHeight: '85%',
            marginHorizontal: 20,
            backgroundColor: theme.colors.card,
            borderRadius: 16,
            padding: 20,
            paddingBottom: insetsBottom + 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 12
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.textPrimary }}>Add Event</Text>
              <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 }}>Event Title</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Enter event title"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary
                  }}
                  autoCapitalize="words"
                />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 }}>Date</Text>
                <DatePickerInput value={eventDate} onChange={setEventDate} placeholder="Select event date" />
              </View>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 8 }}>Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Enter event description..."
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    fontSize: 16,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.textPrimary,
                    height: 100
                  }}
                />
              </View>
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12 }}>Attach Photos</Text>
                <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <TouchableOpacity
                    onPress={handleTakePhoto}
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      marginRight: 12,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <MaterialIcons name="camera-alt" size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: '600' }}>Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handlePickImage}
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  >
                    <MaterialIcons name="photo-library" size={20} color="#FFF" />
                    <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: '600' }}>Gallery</Text>
                  </TouchableOpacity>
                </View>
                {attachedMedia.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
                    {attachedMedia.map((item, index) => (
                      <View key={index} style={{ marginRight: 12, position: 'relative' }}>
                        <Image source={{ uri: item.uri }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                        <TouchableOpacity
                          onPress={() => removeMedia(index)}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            backgroundColor: theme.colors.error,
                            borderRadius: 12,
                            padding: 2
                          }}
                        >
                          <MaterialIcons name="close" size={16} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </ScrollView>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
              <TouchableOpacity
                onPress={onClose}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.border, alignItems: 'center' }}
              >
                <Text style={{ color: theme.colors.textPrimary, fontWeight: '600', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.primary, alignItems: 'center' }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ---------- Calendar Screen ----------
const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock data
  const [events, setEvents] = useState([]);
  const [media, setMedia] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);

  const generateCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const days = [];
    const current = new Date(startDate);
    for (let i = 0; i < 42; i++) {
      days.push({
        date: current.toISOString().split('T')[0],
        day: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    return days;
  };

  const getEventsForDate = (date) => events.filter(e => e.date === date);
  const getMediaForDate = (date) => media.filter(m => m.date === date);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const calendarDays = useMemo(() => generateCalendarDays(year, month), [year, month]);

  const goToPreviousMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  const handleSaveEvent = () => {
    setShowAddModal(false);
    // Refetch would go here
  };

  const selectedEvents = getEventsForDate(selectedDate);
  const selectedMedia = getMediaForDate(selectedDate);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={theme.darkMode ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: theme.colors.card }]}>
        <Text style={[styles.monthYear, { color: theme.colors.textPrimary }]}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
            <Text style={[styles.todayText, { color: theme.colors.primary }]}>Today</Text>
          </TouchableOpacity>
          <View style={styles.navigationButtons}>
            <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-left" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.weekDaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
          <Text key={i} style={[styles.weekDayText, { color: theme.colors.textSecondary }]}>{day}</Text>
        ))}
      </View>
      <ScrollView style={styles.calendarGrid}>
        <View style={styles.daysGrid}>
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isSelected = selectedDate === day.date;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedDate(day.date)}
                style={[
                  styles.dayCell,
                  { backgroundColor: isSelected ? theme.colors.primary : 'transparent' }
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    { color: day.isCurrentMonth ? theme.colors.textPrimary : theme.colors.textSecondary },
                    isSelected && { color: '#FFF' },
                    day.isToday && styles.todayText
                  ]}
                >
                  {day.day}
                </Text>
                {dayEvents.length > 0 && <View style={[styles.eventDot, { backgroundColor: theme.colors.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <View style={[styles.selectedDateSection, { backgroundColor: theme.colors.card }]}>
        <View style={styles.selectedDateHeader}>
          <Text style={[styles.selectedDateTitle, { color: theme.colors.textPrimary }]}>
            {new Date(selectedDate).toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          >
            <MaterialIcons name="add" size={20} color="#FFF" />
            <Text style={{ color: '#FFF', marginLeft: 4, fontWeight: '600' }}>Add Event</Text>
          </TouchableOpacity>
        </View>
        {eventsLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : selectedEvents.length === 0 && selectedMedia.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>No events or media for this date</Text>
        ) : (
          <ScrollView style={{ maxHeight: 200 }}>
            {selectedEvents.map((event, idx) => (
              <View key={idx} style={[styles.eventCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
                <Text style={[styles.eventTitle, { color: theme.colors.textPrimary }]}>{event.title}</Text>
                {event.description && <Text style={[styles.eventDescription, { color: theme.colors.textSecondary }]}>{event.description}</Text>}
              </View>
            ))}
            {selectedMedia.map((item, idx) => (
              <Image key={idx} source={{ uri: item.uri }} style={styles.mediaImage} />
            ))}
          </ScrollView>
        )}
      </View>
      <AddEventModal
        visible={showAddModal}
        selectedDate={selectedDate}
        theme={theme}
        insetsTop={insets.top}
        insetsBottom={insets.bottom}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveEvent}
      />
    </View>
  );
};

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E8DDD4' },
  monthYear: { fontSize: 24, fontWeight: 'bold', marginBottom: 12 },
  headerButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  todayButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3EDE7' },
  todayText: { fontSize: 14, fontWeight: '600' },
  navigationButtons: { flexDirection: 'row', gap: 8 },
  navButton: { padding: 8, borderRadius: 20, backgroundColor: '#F3EDE7' },
  weekDaysHeader: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#FFF' },
  weekDayText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '600' },
  calendarGrid: { flex: 1 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 4 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, marginVertical: 2 },
  dayNumber: { fontSize: 16, fontWeight: '500' },
  eventDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  selectedDateSection: { padding: 20, borderTopWidth: 1, borderTopColor: '#E8DDD4' },
  selectedDateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  selectedDateTitle: { fontSize: 18, fontWeight: 'bold' },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  emptyText: { textAlign: 'center', fontSize: 16, paddingVertical: 20 },
  eventCard: { padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  eventTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  eventDescription: { fontSize: 14 },
  mediaImage: { width: 80, height: 80, borderRadius: 8, marginRight: 8, marginBottom: 8 }
});

// ---------- App Entry ----------
export default function App() {
  return (
    <ThemeProvider>
      <CalendarScreen />
    </ThemeProvider>
  );
}