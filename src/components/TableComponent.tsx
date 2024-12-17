import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ChevronDownIcon } from 'primereact/icons/chevrondown';
import 'primereact/resources/themes/saga-blue/theme.css';

interface ArtistData {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

const TableComponent = () => {
  const [artistData, setArtistData] = useState<ArtistData[]>([]);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [selectedArtists, setSelectedArtists] = useState<ArtistData[]>([]);
  const [rowsToSelect, setRowsToSelect] = useState<number>(0);
  const overlayRef = useRef<OverlayPanel>(null);

  const rowsPerPage = 12;

  const fetchData = async (pageNumber: number, row: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${pageNumber}&limit=${row}`
      );
      const responseData = response.data;
      const data = responseData.data;
      const pagination = responseData.pagination;

      setArtistData(data);
      setTotalRecords(pagination.total);
    } catch (error) {
      console.log('Error while fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page]);

  const onPageChange = (event: any) => {
    setPage(event.page + 1);
    fetchData(event.page + 1, event.rows);
  };

  const handleSelectRows = async () => {
    let remainingRowsToSelect = rowsToSelect;
    let selectedRows: ArtistData[] = [];
    let currentPage = page;

    selectedRows.push(
      ...artistData.slice(0, Math.min(remainingRowsToSelect, artistData.length))
    );
    remainingRowsToSelect -= selectedRows.length;

    while (remainingRowsToSelect > 0) {
      currentPage += 1;
      setLoading(true);
      try {
        const response = await axios.get(
          `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rowsPerPage}`
        );

        const data: ArtistData[] = response.data.data;

        selectedRows.push(
          ...data.slice(0, Math.min(remainingRowsToSelect, data.length))
        );
        remainingRowsToSelect -= data.length;

        if (data.length < rowsPerPage) {
          break;
        }
      } catch (error) {
        console.log('Error while fetching data', error);
        break;
      } finally {
        setLoading(false);
      }
    }

    setSelectedArtists(selectedRows);
    overlayRef.current?.hide();
  };
  

  return (
    loading? <div
    style={{
      border: '8px solid #f3f3f3',
      borderRadius: '50%',
      borderTop: '8px solid #6c63ff',
      width: '60px',
      height: '60px',
      animation: 'spin 2s linear infinite',
    }}
  ></div>:
    <div
      style={{
        width: '90vw',
        left: 0,
        padding: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ 
        marginBottom: '10px', 
        display: 'flex', 
        alignItems: 'center' 
        }}>
        <span style={{ fontSize: '1.5rem', 
          marginRight: '8px' 
          }}>Title</span>
        <ChevronDownIcon
          style={{ cursor: 'pointer' }}
          onClick={(e) => overlayRef.current?.toggle(e)}
        />
      </div>

      <OverlayPanel ref={overlayRef}>
        <div style={{ padding: '10px' }}>
          <h3>Enter the number of rows to select</h3>
          <input
            type="number"
            value={rowsToSelect}
            onChange={(e) => setRowsToSelect(Number(e.target.value))}
            style={{ marginBottom: '10px', width: '100px' }}
          />
          <button onClick={handleSelectRows} style={{ marginLeft: '10px' }}>
            Select
          </button>
        </div>
      </OverlayPanel>

      <DataTable
        value={artistData}
        stripedRows
        paginator
        rows={rowsPerPage}
        totalRecords={totalRecords}
        onPage={onPageChange}
        loading={loading}
        lazy
        scrollable
        scrollHeight="calc(100vh - 50px)"
        rowsPerPageOptions={[5, 12, 25, 50]}
        first={(page - 1) * rowsPerPage}
        tableStyle={{ width: '100%', height: '100%' }}
        selection={selectedArtists}
        onSelectionChange={(e) => setSelectedArtists(e.value)}
        selectionMode="multiple"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: '3em' }}
          exportable={false}
        ></Column>
        <Column field="title" header="Title" style={{ width: '15%' }} sortable />
        <Column
          field="place_of_origin"
          header="Place of Origin"
          style={{ width: '15%' }}
        />
        <Column
          field="artist_display"
          header="Artist"
          style={{ width: '20%' }}
        />
        <Column
          field="inscriptions"
          header="Inscriptions"
          style={{ width: '30%' }}
        />
        <Column
          field="date_start"
          header="Date Start"
          style={{ width: '10%' }}
        />
        <Column field="date_end" header="Date End" style={{ width: '10%' }} />
      </DataTable>
    </div>
  );
};

export default TableComponent;
