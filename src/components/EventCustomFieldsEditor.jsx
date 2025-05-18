// src/components/EventCustomFieldsEditor.js - Komponen baru
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const EventCustomFieldsEditor = ({ customFields, setCustomFields }) => {
  const [newField, setNewField] = useState({
    fieldId: '',
    label: '',
    type: 'text',
    required: false,
    options: [],
    placeholder: ''
  });
  
  const [newOption, setNewOption] = useState('');
  
  // Generate unique fieldId
  const generateFieldId = (label) => {
    const base = label.toLowerCase().replace(/[^a-z0-9]/g, '');
    const timestamp = Date.now().toString().slice(-4);
    return `${base}${timestamp}`;
  };
  
  const addField = () => {
    if (!newField.label) return;
    
    const fieldId = newField.fieldId || generateFieldId(newField.label);
    
    setCustomFields([
      ...customFields,
      {
        ...newField,
        fieldId
      }
    ]);
    
    // Reset form
    setNewField({
      fieldId: '',
      label: '',
      type: 'text',
      required: false,
      options: [],
      placeholder: ''
    });
  };
  
  const removeField = (index) => {
    const updatedFields = [...customFields];
    updatedFields.splice(index, 1);
    setCustomFields(updatedFields);
  };
  
  const updateField = (index, field) => {
    const updatedFields = [...customFields];
    updatedFields[index] = field;
    setCustomFields(updatedFields);
  };
  
  const addOption = (index) => {
    if (!newOption) return;
    
    const updatedFields = [...customFields];
    updatedFields[index].options = [...updatedFields[index].options, newOption];
    setCustomFields(updatedFields);
    setNewOption('');
  };
  
  const removeOption = (fieldIndex, optionIndex) => {
    const updatedFields = [...customFields];
    updatedFields[fieldIndex].options.splice(optionIndex, 1);
    setCustomFields(updatedFields);
  };
  
  // Handle drag and drop reordering
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(customFields);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCustomFields(items);
  };
  
  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pertanyaan Pendaftaran Kustom</h3>
      
      {/* Fields list */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="custom-fields">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 mb-6"
            >
              {customFields.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-gray-500 text-center">
                  Belum ada pertanyaan kustom. Tambahkan di bawah.
                </div>
              ) : (
                customFields.map((field, index) => (
                  <Draggable key={field.fieldId} draggableId={field.fieldId} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-4 bg-white border border-gray-200 rounded-md shadow-sm"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                                </svg>
                              </div>
                              <h4 className="font-medium">{field.label}</h4>
                              {field.required && (
                                <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                  Wajib
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              Tipe: <span className="capitalize">{field.type}</span> | ID: {field.fieldId}
                            </div>
                            
                            {['select', 'checkbox', 'radio'].includes(field.type) && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700 mb-1">Opsi:</p>
                                <div className="flex flex-wrap gap-2">
                                  {field.options.map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                                      {option}
                                      <button
                                        type="button"
                                        onClick={() => removeOption(index, optionIndex)}
                                        className="ml-1 text-gray-500 hover:text-gray-700"
                                      >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="mt-2 flex">
                                  <input
                                    type="text"
                                    placeholder="Tambahkan opsi baru"
                                    value={newOption}
                                    onChange={(e) => setNewOption(e.target.value)}
                                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => addOption(index)}
                                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                                  >
                                    Tambah
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => removeField(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      
      {/* Add new field form */}
      <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
        <h4 className="font-medium mb-3">Tambah Pertanyaan Baru</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Pertanyaan
            </label>
            <input
              type="text"
              value={newField.label}
              onChange={(e) => setNewField({ ...newField, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Misal: Ukuran Kaos"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipe Input
            </label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="text">Text (Input Teks)</option>
              <option value="textarea">Textarea (Teks Panjang)</option>
              <option value="select">Select (Dropdown)</option>
              <option value="checkbox">Checkbox (Pilihan Ganda)</option>
              <option value="radio">Radio (Pilihan Tunggal)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={newField.placeholder}
              onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Misal: Pilih ukuran kaos Anda"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="required-field"
              checked={newField.required}
              onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="required-field" className="ml-2 block text-sm text-gray-700">
              Wajib diisi
            </label>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            type="button"
            onClick={addField}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Tambah Pertanyaan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCustomFieldsEditor;