import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import { getMediaUrl } from '../utils/media';
import UserSettings from '@/components/UserSettings';
import type {
  ApiResponse,
  ListeningHistoryItem,
  UpdateProfilePayload,
  UpdateProfileResponse,
  UploadImageResponse,
} from '../types';

type ProfileTab = 'profile' | 'settings';

const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return date.toLocaleDateString();
};

const UserPage: React.FC = () => {
  const { activeTab: rawTab } = useLocalSearchParams<{
    activeTab?: string | string[];
  }>();
  const paramTab = Array.isArray(rawTab) ? rawTab[0] : rawTab;

  const { isLoggedIn } = useAuth();
  const { userProfile, setUserProfile } = useUser();
  const { addToast } = useToast();

  // UI States
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    paramTab === 'settings' ? 'settings' : 'profile'
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showFullHistory, setShowFullHistory] = useState<boolean>(false);
  const [history, setHistory] = useState<ListeningHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  // Form States
  const [editForm, setEditForm] = useState<UpdateProfilePayload>({
    first_name: '',
    last_name: '',
  });

  // Upload States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState<boolean>(false);

  useEffect(() => {
    if (paramTab === 'profile' || paramTab === 'settings') {
      setActiveTab(paramTab);
    }
  }, [paramTab]);

  // === DATA FETCHING ===
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get<ApiResponse<ListeningHistoryItem[]>>(
          '/user/history'
        );
        if (data.success) setHistory(data.data || []);
      } catch (err) {
        console.error('❌ Failed to load history:', err);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    if (isLoggedIn && userProfile) fetchHistory();
  }, [isLoggedIn, userProfile]);

  useEffect(() => {
    if (userProfile) {
      setEditForm({
        first_name: userProfile.first_name || '',
        last_name: userProfile.last_name || '',
      });
    }
  }, [userProfile, isEditing]);

  // === PROFILE ACTIONS ===
  const handleSaveProfile = async () => {
    try {
      const { data } = await api.put<UpdateProfileResponse>(
        '/user/update',
        editForm
      );
      if (data.success) {
        setUserProfile((prev) => (prev ? { ...prev, ...editForm } : prev));
        setIsEditing(false);
        addToast('Profile synchronized!', 'success');
      }
    } catch {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleImagePick = async (type: 'avatar' | 'banner') => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      addToast('Media library permission is required', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const isAvatar = type === 'avatar';
    if (isAvatar) setIsUploadingAvatar(true);
    else setIsUploadingBanner(true);

    const fileName =
      asset.fileName || `${type}-${Date.now()}.jpg`;
    const mimeType = asset.mimeType || 'image/jpeg';

    const formData = new FormData();
    formData.append(isAvatar ? 'user_image' : 'banner_image', {
      uri: asset.uri,
      name: fileName,
      type: mimeType,
    } as unknown as Blob);

    try {
      const endpoint = isAvatar
        ? '/user/upload-avatar'
        : '/user/upload-banner';
      const { data } = await api.post<UploadImageResponse>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (data.success) {
        const updateKey = isAvatar ? 'user_image' : 'banner_image';
        setUserProfile((prev) =>
          prev ? { ...prev, [updateKey]: data.imageUrl } : prev
        );
        addToast(`${isAvatar ? 'Avatar' : 'Banner'} updated!`, 'success');
      }
    } catch {
      addToast('Upload failed', 'error');
    } finally {
      if (isAvatar) setIsUploadingAvatar(false);
      else setIsUploadingBanner(false);
    }
  };

  const avatarSrc = getMediaUrl(userProfile?.user_image);
  const bannerSrc = getMediaUrl(userProfile?.banner_image);
  const displayedHistory = showFullHistory ? history : history.slice(0, 5);

  if (!isLoggedIn) return null;

  return (
    <ScrollView
      className="flex-1 bg-background-primary"
      contentContainerStyle={{ paddingBottom: 128 }}
      showsVerticalScrollIndicator={false}
    >
      {/* INTERACTIVE BANNER */}
      <View className="relative h-56 w-full bg-background-secondary overflow-hidden">
        {bannerSrc ? (
          <Image
            source={{ uri: bannerSrc }}
            className={`absolute inset-0 w-full h-full ${
              isUploadingBanner ? 'opacity-30' : 'opacity-100'
            }`}
            resizeMode="cover"
          />
        ) : (
          <View className="absolute inset-0 bg-accent-primary/10" />
        )}

        <Pressable
          onPress={() => handleImagePick('banner')}
          disabled={isUploadingBanner}
          className="absolute right-4 top-12 px-4 py-2 bg-background-primary/75 border border-border rounded-xl flex-row items-center gap-2 active:scale-95"
        >
          {isUploadingBanner ? (
            <ActivityIndicator size="small" />
          ) : (
            <Ionicons name="camera-outline" size={16} color="#fff" />
          )}
          <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary">
            Change Banner
          </Text>
        </Pressable>
      </View>

      <View className="px-5 -mt-16 relative z-20">
        {/* PROFILE HEADER SECTION */}
        <View className="items-center gap-4 mb-10">
          <Pressable
            onPress={() => handleImagePick('avatar')}
            disabled={isUploadingAvatar}
            className="relative"
          >
            <View
              className={`w-36 h-36 rounded-[2.25rem] bg-background-secondary border-4 border-background-primary overflow-hidden items-center justify-center ${
                isUploadingAvatar ? 'opacity-50' : ''
              }`}
            >
              {avatarSrc ? (
                <Image
                  source={{ uri: avatarSrc }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-5xl font-black text-accent-primary">
                  {userProfile?.username?.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>

            <View className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-accent-primary items-center justify-center border-2 border-background-primary">
              {isUploadingAvatar ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="camera" size={16} color="#000" />
              )}
            </View>
          </Pressable>

          <View className="w-full items-center">
            {isEditing ? (
              <View className="flex-row gap-3 w-full mb-3">
                <TextInput
                  value={editForm.first_name}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, first_name: text }))
                  }
                  placeholder="First Name"
                  placeholderTextColor="#6b7280"
                  className="flex-1 bg-background-secondary border border-border rounded-xl px-4 py-3 text-base font-black text-text-primary"
                />
                <TextInput
                  value={editForm.last_name}
                  onChangeText={(text) =>
                    setEditForm((prev) => ({ ...prev, last_name: text }))
                  }
                  placeholder="Last Name"
                  placeholderTextColor="#6b7280"
                  className="flex-1 bg-background-secondary border border-border rounded-xl px-4 py-3 text-base font-black text-text-primary"
                />
              </View>
            ) : (
              <Text className="text-3xl font-black tracking-tighter uppercase italic text-text-primary text-center mb-1">
                {userProfile?.first_name} {userProfile?.last_name}
              </Text>
            )}
            <Text className="text-accent-primary text-base font-bold tracking-tight opacity-80">
              @{userProfile?.username}
            </Text>
          </View>

          <View className="mt-1">
            {isEditing ? (
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setIsEditing(false)}
                  className="px-6 py-2.5 rounded-xl bg-background-secondary active:bg-background-hover"
                >
                  <Text className="font-bold text-sm text-text-primary">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveProfile}
                  className="px-6 py-2.5 rounded-xl bg-accent-primary active:scale-95"
                >
                  <Text className="font-black text-sm text-background-primary">
                    Save
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl border border-border active:border-accent-primary"
              >
                <Text className="font-black text-xs uppercase tracking-widest text-text-primary">
                  Edit Profile
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* TABS */}
        <View className="flex-row gap-8 border-b border-border mb-8">
          {(['profile', 'settings'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`pb-4 border-b-2 ${
                activeTab === tab
                  ? 'border-accent-primary'
                  : 'border-transparent'
              }`}
            >
              <Text
                className={`text-xs font-black uppercase tracking-[0.3em] ${
                  activeTab === tab ? 'text-text-primary' : 'text-text-muted'
                }`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* TAB CONTENT */}
        {activeTab === 'profile' && (
          <View className="mb-10">
            <Text className="text-xs font-black uppercase tracking-[0.4em] text-text-muted mb-5 italic">
              Listening History
            </Text>

            {isLoadingHistory ? (
              <View className="py-12 items-center">
                <ActivityIndicator size="small" />
                <Text className="mt-3 text-text-muted font-bold text-xs uppercase tracking-widest">
                  Scanning History...
                </Text>
              </View>
            ) : (
              <View className="gap-2">
                {displayedHistory.map((track) => (
                  <View
                    key={track.history_id}
                    className="flex-row items-center gap-4 p-3 rounded-2xl bg-background-secondary/30 border border-border/40"
                  >
                    <Image
                      source={{ uri: getMediaUrl(track.cover_path) }}
                      className="w-12 h-12 rounded-xl bg-border/20"
                      resizeMode="cover"
                    />
                    <View className="flex-1 min-w-0">
                      <Text
                        numberOfLines={1}
                        className="font-black text-sm tracking-tight text-text-primary"
                      >
                        {track.title}
                      </Text>
                      <Text
                        numberOfLines={1}
                        className="text-xs text-text-secondary font-bold mt-0.5"
                      >
                        {track.artist || 'Unknown'} • {track.anime || 'Single'}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-black uppercase tracking-widest text-text-muted">
                      {getTimeAgo(track.created_at)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {history.length > 5 && (
              <Pressable
                onPress={() => setShowFullHistory((prev) => !prev)}
                className="w-full mt-5 py-3.5 rounded-xl border border-border items-center active:bg-background-secondary"
              >
                <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-text-primary">
                  {showFullHistory
                    ? 'Close View ↑'
                    : `View ${history.length - 5} More ↓`}
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {activeTab === 'settings' && (
          <View className="mb-10">
            <UserSettings />
          </View>
        )}

        {/* ACCOUNT INFO CARD */}
        <View className="bg-background-secondary/30 border border-border rounded-3xl p-6">
          <Text className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-primary mb-6 italic">
            Intelligence
          </Text>

          <View className="gap-6">
            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                Primary Node
              </Text>
              <Text className="font-bold text-text-primary">
                {userProfile?.email}
              </Text>
            </View>

            <View>
              <Text className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">
                Activation Date
              </Text>
              <Text className="font-bold text-text-primary">
                {userProfile?.created_at
                  ? new Date(userProfile.created_at).toLocaleDateString(
                      'en-US',
                      { month: 'long', year: 'numeric' }
                    )
                  : 'N/A'}
              </Text>
            </View>

            <View className="px-4 py-2.5 bg-accent-primary/10 border border-accent-primary/20 rounded-xl items-center">
              <Text className="text-accent-primary text-[10px] font-black uppercase tracking-widest">
                Free Tier Verified
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserPage;