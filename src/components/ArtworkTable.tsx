import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import type { PaginatorPageChangeEvent } from 'primereact/paginator';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import type { Artwork, ApiResponse } from '../types/artwork';

const API_BASE_URL = 'https://api.artic.edu/api/v1/artworks';
const ROWS_PER_PAGE = 12;

export default function ArtworkTable() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [first, setFirst] = useState<number>(0);
  
  const [selectedCount, setSelectedCount] = useState<number>(0);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deselectedIds, setDeselectedIds] = useState<Set<number>>(new Set());
  
  const [customSelectInput, setCustomSelectInput] = useState<string>('');
  const overlayPanelRef = useRef<OverlayPanel>(null);

  const fetchArtworks = async (page: number): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}?page=${page}`);
      const data: ApiResponse = await response.json();
      
      setArtworks(data.data);
      setTotalRecords(data.pagination.total);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks(1);
  }, []);

  const onPageChange = (event: PaginatorPageChangeEvent): void => {
    const newPage = Math.floor(event.first / ROWS_PER_PAGE) + 1;
    setFirst(event.first);
    setCurrentPage(newPage);
    fetchArtworks(newPage);
  };

  const getGlobalIndex = (rowIndex: number): number => {
    return (currentPage - 1) * ROWS_PER_PAGE + rowIndex;
  };

  const isRowSelected = (artworkId: number, rowIndex: number): boolean => {
    const globalIndex = getGlobalIndex(rowIndex);
    
    if (deselectedIds.has(artworkId)) {
      return false;
    }
    
    if (selectedIds.has(artworkId)) {
      return true;
    }
    
    return globalIndex < selectedCount;
  };

  const handleRowCheckboxChange = (artworkId: number, rowIndex: number): void => {
    const globalIndex = getGlobalIndex(rowIndex);
    const currentlySelected = isRowSelected(artworkId, rowIndex);
    
    if (currentlySelected) {
      if (globalIndex < selectedCount) {
        setDeselectedIds(prev => new Set([...prev, artworkId]));
      } else {
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(artworkId);
          return newSet;
        });
      }
    } else {
      if (globalIndex < selectedCount) {
        setDeselectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(artworkId);
          return newSet;
        });
      } else {
        setSelectedIds(prev => new Set([...prev, artworkId]));
      }
    }
  };

  const handleSelectAllPage = (): void => {
    const allSelected = artworks.every((art, idx) => isRowSelected(art.id, idx));
    
    if (allSelected) {
      const newSelectedIds = new Set(selectedIds);
      const newDeselectedIds = new Set(deselectedIds);
      
      artworks.forEach((artwork, index) => {
        const globalIndex = getGlobalIndex(index);
        if (globalIndex < selectedCount) {
          newDeselectedIds.add(artwork.id);
        } else {
          newSelectedIds.delete(artwork.id);
        }
      });
      
      setSelectedIds(newSelectedIds);
      setDeselectedIds(newDeselectedIds);
    } else {
      const newSelectedIds = new Set(selectedIds);
      const newDeselectedIds = new Set(deselectedIds);
      
      artworks.forEach((artwork, index) => {
        const globalIndex = getGlobalIndex(index);
        if (globalIndex < selectedCount) {
          newDeselectedIds.delete(artwork.id);
        } else {
          newSelectedIds.add(artwork.id);
        }
      });
      
      setSelectedIds(newSelectedIds);
      setDeselectedIds(newDeselectedIds);
    }
  };

  const isAllPageSelected = (): boolean => {
    if (artworks.length === 0) return false;
    return artworks.every((art, idx) => isRowSelected(art.id, idx));
  };

  const getTotalSelectedCount = (): number => {
    const bulkSelected = Math.max(0, Math.min(selectedCount, totalRecords) - deselectedIds.size);
    return bulkSelected + selectedIds.size;
  };

  const handleCustomSelect = (): void => {
    const count = parseInt(customSelectInput);
    
    if (isNaN(count) || count < 0) {
      return;
    }
    
    setSelectedCount(count);
    setSelectedIds(new Set());
    setDeselectedIds(new Set());
    
    setCustomSelectInput('');
    overlayPanelRef.current?.hide();
  };

  return (
    <div className="artwork-table-container">
      <div className="selection-info">
        Selected: <strong>{getTotalSelectedCount()}</strong> rows
      </div>
      
      <DataTable
        value={artworks}
        loading={loading}
        tableStyle={{ minWidth: '60rem' }}
        scrollable
        scrollHeight="600px"
        dataKey="id"
        key={`table-${selectedIds.size}-${deselectedIds.size}-${selectedCount}`}
      >
        <Column
          header={
            <div className="header-checkbox-container">
              <input
                type="checkbox"
                checked={isAllPageSelected()}
                onChange={handleSelectAllPage}
                className="row-checkbox"
              />
              <Button
                icon="pi pi-chevron-down"
                className="p-button-text p-button-sm custom-select-btn"
                onClick={(e) => overlayPanelRef.current?.toggle(e)}
                aria-label="Custom selection"
              />
            </div>
          }
          body={(rowData: Artwork) => {
            const rowIndex = artworks.findIndex(a => a.id === rowData.id);
            const checked = isRowSelected(rowData.id, rowIndex);
            return (
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleRowCheckboxChange(rowData.id, rowIndex)}
                className="row-checkbox"
              />
            );
          }}
          style={{ width: '80px' }}
          frozen
        />
        <Column 
          field="title" 
          header="TITLE" 
          style={{ minWidth: '200px' }}
        />
        <Column 
          field="place_of_origin" 
          header="PLACE OF ORIGIN" 
          style={{ minWidth: '150px' }}
        />
        <Column 
          field="artist_display" 
          header="ARTIST" 
          style={{ minWidth: '250px' }}
        />
        <Column 
          field="inscriptions" 
          header="INSCRIPTIONS" 
          style={{ minWidth: '200px' }}
        />
        <Column 
          field="date_start" 
          header="START DATE" 
          style={{ minWidth: '100px' }}
        />
        <Column 
          field="date_end" 
          header="END DATE" 
          style={{ minWidth: '100px' }}
        />
      </DataTable>

      <div className="paginator-container">
        <div className="entries-info">
          Showing <strong>{first + 1}</strong> to <strong>{Math.min(first + ROWS_PER_PAGE, totalRecords)}</strong> of <strong>{totalRecords.toLocaleString()}</strong> entries
        </div>
        <Paginator
          first={first}
          rows={ROWS_PER_PAGE}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>

      <OverlayPanel ref={overlayPanelRef} className="custom-select-overlay">
        <div className="overlay-content">
          <h4>Select Multiple Rows</h4>
          <p>Enter number of rows to select across all pages</p>
          <div className="input-group">
            <InputText
              value={customSelectInput}
              onChange={(e) => setCustomSelectInput(e.target.value)}
              placeholder="e.g., 25"
              keyfilter="pint"
              type="number"
              min={0}
            />
            <Button
              label="Select"
              onClick={handleCustomSelect}
              className="p-button-primary select-btn"
            />
          </div>
        </div>
      </OverlayPanel>
    </div>
  );
}
