import { collection, addDoc, getDocs, Timestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from '../api/api';
import type { Word, FavoriteList } from '../types/types';

// Save a list of words to favorites
export const saveFavoriteList = async (listName: string, words: Word[]): Promise<string | null> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const docRef = await addDoc(collection(firestore, `users/${user.uid}/favorites`), {
            listName,
            createdAt: Timestamp.now(),
            words
        });

        return docRef.id;
    } catch (error) {
        console.error('Error saving favorite list:', error);
        return null;
    }
};

// Get all favorite lists for the current user
export const getFavoriteLists = async (): Promise<FavoriteList[]> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const favoriteListsRef = collection(firestore, `users/${user.uid}/favorites`);
        const querySnapshot = await getDocs(favoriteListsRef);

        const lists: FavoriteList[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            lists.push({
                id: doc.id,
                listName: data.listName,
                createdAt: data.createdAt.toDate(),
                words: data.words
            });
        });

        return lists;
    } catch (error) {
        console.error('Error getting favorite lists:', error);
        return [];
    }
};

// Get a specific favorite list by ID
export const getFavoriteListById = async (listId: string): Promise<FavoriteList | null> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        const docRef = doc(firestore, `users/${user.uid}/favorites`, listId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                listName: data.listName,
                createdAt: data.createdAt.toDate(),
                words: data.words
            };
        }

        return null;
    } catch (error) {
        console.error('Error getting favorite list:', error);
        return null;
    }
};

// Delete a favorite list
export const deleteFavoriteList = async (listId: string): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated');
        }

        await deleteDoc(doc(firestore, `users/${user.uid}/favorites`, listId));
        return true;
    } catch (error) {
        console.error('Error deleting favorite list:', error);
        return false;
    }
}; 