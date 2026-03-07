import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuotationForm from '../../components/admin/QuotationForm';

export default function CreateQuotation() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    return (
        <div className="max-w-4xl">
            <QuotationForm
                orderId={orderId}
                onClose={() => navigate('/admin/orders')}
                onSuccess={() => navigate('/admin/quotations')}
            />
        </div>
    );
}
