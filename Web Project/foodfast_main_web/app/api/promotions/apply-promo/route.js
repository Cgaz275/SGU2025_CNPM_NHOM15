import { NextResponse } from 'next/server';
import { db } from '@/config/FirebaseAdminConfig';
import admin from 'firebase-admin';

export async function POST(request) {
    try {

        const body = await request.json();
        const { code, collection: collectionName, restaurantId } = body;

        if (!code || !collectionName) {
            return NextResponse.json(
                { error: 'Code and collection are required' },
                { status: 400 }
            );
        }

        if (collectionName !== 'promotions' && collectionName !== 'promotions_restaurant') {
            return NextResponse.json(
                { error: 'Invalid collection name' },
                { status: 400 }
            );
        }

        const promoRef = db.collection(collectionName);
        let queryRef = promoRef.where('code', '==', code.toUpperCase());

        if (collectionName === 'promotions_restaurant' && restaurantId) {
            queryRef = queryRef.where('restaurantId', '==', restaurantId);
        }

        const snapshot = await queryRef.get();

        if (snapshot.empty) {
            return NextResponse.json(
                { error: 'Promotion code not found' },
                { status: 404 }
            );
        }

        const promoDoc = snapshot.docs[0];
        const promoId = promoDoc.id;
        const promoData = promoDoc.data();

        if (!promoData.is_enable) {
            return NextResponse.json(
                { error: 'This promotion is not active' },
                { status: 400 }
            );
        }

        // Handle both Firestore Timestamp and ISO string formats
        let expiryDate;
        if (promoData.expiryDate && typeof promoData.expiryDate.toDate === 'function') {
            // Firestore Timestamp object
            expiryDate = promoData.expiryDate.toDate();
        } else {
            // ISO string or other date format
            expiryDate = new Date(promoData.expiryDate);
        }

        if (expiryDate < new Date()) {
            return NextResponse.json(
                { error: 'This promotion has expired' },
                { status: 400 }
            );
        }

        const docRef = db.collection(collectionName).doc(promoId);
        let updatedPromo;

        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(docRef);

            if (!doc.exists()) {
                throw new Error('Promotion document not found during transaction');
            }

            const currentData = doc.data();
            const currentUsage = currentData.usage_count || 0;
            const newUsage = currentUsage + 1;
            const usageLimit = currentData.usage_limit || 999;

            const updateData = {
                usage_count: newUsage,
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (newUsage >= usageLimit && currentData.is_enable) {
                updateData.is_enable = false;
            }

            transaction.update(docRef, updateData);

            updatedPromo = {
                ...currentData,
                ...updateData,
                id: promoId,
            };
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Promotion applied successfully',
                promotion: updatedPromo,
                wasDisabled: !updatedPromo.is_enable && promoData.is_enable,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error applying promotion:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to apply promotion' },
            { status: 500 }
        );
    }
}
