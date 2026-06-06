
"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { User } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  profile: UserProfile | null;
  refreshProfile: () => void; // Standardized to no-op if using real-time useDoc
};

export type UserProfile = {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFats: number;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();

  const userDocRef = useMemo(() => {
    return user ? doc(db, "users", user.uid) : null;
  }, [db, user]);

  const { data: profile, loading: profileLoading } = useDoc<UserProfile>(userDocRef);

  useEffect(() => {
    if (user && !profile && !profileLoading) {
      // Create default profile if it doesn't exist
      const defaultProfile: UserProfile = {
        weight: 70,
        height: 175,
        age: 25,
        gender: 'male',
        activityLevel: 1.2,
        targetCalories: 2000,
        targetProtein: 150,
        targetCarbs: 200,
        targetFats: 70
      };
      
      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, defaultProfile, { merge: true })
        .catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: defaultProfile,
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }
  }, [user, profile, profileLoading, db]);

  const loading = authLoading || (!!user && profileLoading);

  return (
    <AuthContext.Provider value={{ user, loading, profile, refreshProfile: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
