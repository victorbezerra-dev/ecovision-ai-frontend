import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  addDoc,
  collection,
  doc,
  getDocFromServer,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { ReportItem } from '../models/report';
import { firebaseDb } from './firebase-app';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly collectionName = 'reports';

  testConnection(): Promise<void> {
    return getDocFromServer(doc(firebaseDb, 'test', 'connection'))
      .then(() => void 0)
      .catch(() => void 0);
  }

  watchReports(): Observable<ReportItem[]> {
    return new Observable<ReportItem[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        collection(firebaseDb, this.collectionName),
        (snapshot) => {
          const reports = snapshot.docs
            .map((snapshotDoc) => ({ id: snapshotDoc.id, ...snapshotDoc.data() } as ReportItem))
            .sort((a, b) => {
              const dateA = a.createdAt?.seconds || 0;
              const dateB = b.createdAt?.seconds || 0;
              return dateB - dateA;
            });

          subscriber.next(reports);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  async createReport(report: Omit<ReportItem, 'id' | 'createdAt'>): Promise<void> {
    await addDoc(collection(firebaseDb, this.collectionName), {
      ...report,
      createdAt: serverTimestamp(),
    });
  }
}