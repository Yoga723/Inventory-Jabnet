import { OLT_OPTIONS } from 'app/utils/constants';
import React from 'react';
import { useAppSelector } from 'store/Hooks';

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filterCustomer: any;
    setFilters: (filterCustomer: any) => void;
    onApply: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filterCustomer, setFilters, onApply }) => {
    const { pakets, mitras } = useAppSelector((state) => state.filterCustomers);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters({ ...filterCustomer, [name]: value });
    };

    const handleReset = () => {
        setFilters({
            sortBy: 'last_edited',
            sortOrder: 'DESC',
            olt: '',
            odp: '',
            id_paket: '',
            id_mitra: '',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Filter Customers</h3>
                
                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">Sort By</span></label>
                    <select name="sortBy" value={filterCustomer.sortBy} onChange={handleChange} className="select select-bordered">
                        <option value="last_edited">Last Edited</option>
                        <option value="name">Name</option>
                        <option value="id">Customer ID</option>
                    </select>
                </div>

                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">Sort Order</span></label>
                    <select name="sortOrder" value={filterCustomer.sortOrder} onChange={handleChange} className="select select-bordered">
                        <option value="DESC">Descending</option>
                        <option value="ASC">Ascending</option>
                    </select>
                </div>
                
                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">OLT</span></label>
                    <select name="olt" value={filterCustomer.olt} onChange={handleChange} className="select select-bordered">
                        <option value="">All OLTs</option>
                        {OLT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>

                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">Internet Package</span></label>
                    <select name="id_paket" value={filterCustomer.id_paket} onChange={handleChange} className="select select-bordered">
                        <option value="">All Packages</option>
                        {pakets.map(p => <option key={p.id_paket} value={p.id_paket}>{p.nama_paket}</option>)}
                    </select>
                </div>

                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">Partner</span></label>
                    <select name="id_mitra" value={filterCustomer.id_mitra} onChange={handleChange} className="select select-bordered">
                        <option value="">All Partners</option>
                        {mitras.map(m => <option key={m.id_mitra} value={m.id_mitra}>{m.nama_mitra}</option>)}
                    </select>
                </div>

                <div className="form-control w-full my-2">
                    <label className="label"><span className="label-text">ODP</span></label>
                    <input type="text" name="odp" value={filterCustomer.odp} onChange={handleChange} placeholder="Enter ODP" className="input input-bordered" />
                </div>
                
                <div className="modal-action">
                    <button onClick={handleReset} className="btn btn-ghost">Reset</button>
                    <button onClick={onClose} className="btn">Cancel</button>
                    <button onClick={onApply} className="btn btn-primary">Apply</button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;
