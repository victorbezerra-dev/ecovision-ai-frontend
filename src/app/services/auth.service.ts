import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../models/report';
import { firebaseAuth, firebaseDb } from './firebase-app';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user$ = new BehaviorSubject<User | null>(null);
  readonly profile$ = new BehaviorSubject<UserProfile | null>(null);
  readonly loading$ = new BehaviorSubject<boolean>(true);

  constructor() {
    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      this.user$.next(firebaseUser);

      if (!firebaseUser) {
        this.profile$.next(null);
        this.loading$.next(false);
        return;
      }

      const userDocRef = doc(firebaseDb, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        this.profile$.next(userDoc.data() as UserProfile);
      } else {
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: 'user',
        };
        await setDoc(userDocRef, newProfile);
        this.profile$.next(newProfile);
      }

      this.loading$.next(false);
    });
  }

  get currentUser(): User | null {
    return this.user$.value;
  }

  async signIn(): Promise<void> {
    await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
  }

  async logout(): Promise<void> {
    await signOut(firebaseAuth);
  }
}