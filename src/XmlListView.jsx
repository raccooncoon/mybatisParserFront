import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import {Box, Button, Modal, Tab, Tabs, TextField, Typography} from "@mui/material";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import InfiniteScroll from 'react-infinite-scroll-component';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {a11yDark} from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as PropTypes from "prop-types";
import UrlListView from "./UrlListView";

Tabs.propTypes = {
    onChange: PropTypes.func,
    centered: PropTypes.bool,
    indicatorColor: PropTypes.string,
    value: PropTypes.number,
    textColor: PropTypes.string,
    children: PropTypes.node
};
const XmlListView = () => {
    const [data, setData] = useState([]);
    const [pageInfo, setPageInfo] = useState({last: false, pageSize: 50, pageNumber: 0, totalElements: 0});
    const [searchTerm, setSearchTerm] = useState('');
    const [mapperTypes, setMapperTypes] = useState(['update', 'delete', 'insert']);
    const [selectedRow, setSelectedRow] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 현재 활성 탭

    const END_POINT_URL = `api/mapperBody/${searchTerm}`;
    // const END_POINT_URL = `http://localhost:8080/api/mapperBody/${searchTerm}`;
    const handleOpenModal = (row) => {
        console.log(row);
        setSelectedRow(row);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedRow(null);
        setIsModalOpen(false);
    };

    // Tab을 변경할 때 호출되는 함수
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const defaultPageInfo = {pageSize: 50, pageNumber: 0, last: false, totalElements: 0};

    useEffect(() => {
        fetchData();
    }, [searchTerm, mapperTypes]); // Re-fetch data when searchTerm changes

    const fetchData = async () => {
        // console.log(">>>>>>>>>>>>>>.");
        // console.log(mapperTypes);
        // console.log(pageInfo);
        // console.log(selectedRow);
        // console.log(URL);
        try {
            if (searchTerm.length > 1) {
                const response = await axios.get(END_POINT_URL, {
                    params: {
                        page: pageInfo.pageNumber, size: pageInfo.pageSize, mapperTypes: mapperTypes.toString(),
                    },
                });
                setData(response.data.content);
                setPageInfo({
                    pageSize: response.data.pageable.pageSize,
                    pageNumber: response.data.pageable.pageNumber,
                    last: response.data.last,
                    totalElements: response.data.totalElements,
                });
            } else {
                setData([]);
                setPageInfo(defaultPageInfo);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);

        // 페이징 초기값 업데이트
        setPageInfo(defaultPageInfo);
    };

    const handleChange = (event) => {
        const {id, checked} = event.target;
        // console.log(id);
        // console.log(checked);

        setMapperTypes((prevTypes) => {
            if (checked) {
                return [...prevTypes, id];
            } else {
                return prevTypes.filter((item) => item !== id);
            }
        });

        // 페이징 초기값 업데이트
        setData([]);
        setPageInfo(defaultPageInfo);

    }

    const fetchMoreData = async () => {
        // 페이징 정보 업데이트
        try {
            if (!pageInfo.last) {
                const response = await axios.get(END_POINT_URL, {
                    params: {
                        page: pageInfo.pageNumber + 1, // Increment the page number
                        size: pageInfo.pageSize, mapperTypes: mapperTypes.toString(),
                    },
                });

                setData((prevData) => [...prevData, ...response.data.content]);
                // Update the pageInfo
                setPageInfo({
                    pageSize: response.data.pageable.pageSize,
                    pageNumber: response.data.pageable.pageNumber,
                    last: response.data.last,
                    totalElements: response.data.totalElements,
                });
            }
        } catch (error) {
            console.error('Error fetching more data:', error);
        }
    }


    return (<Container fixed style={{maxWidth: '1800px', height: '100vh'}}>
        <Grid container spacing={2} justifyContent={"space-between"}>
            <Grid item xs={12} md={4}>
                <FormControlLabel
                    label="C"
                    control={<Checkbox id="insert" defaultChecked color="secondary" onChange={handleChange}/>}
                />
                <FormControlLabel
                    label="R"
                    control={<Checkbox id="select" color="default" onChange={handleChange}/>}
                />
                <FormControlLabel
                    label="U"
                    control={<Checkbox id="update" defaultChecked onChange={handleChange}/>}
                />
                <FormControlLabel
                    label="D"
                    control={<Checkbox id="delete" defaultChecked color="success" onChange={handleChange}/>}
                />
            </Grid>
            <Grid item xs={12} md={4}>
                <div style={{textAlign: 'center', marginTop: '20px'}}>
                    <Typography id="mapperType" variant="h6" component="h2">
                        Total : {pageInfo.totalElements}
                    </Typography>
                </div>
            </Grid>
            <Grid item xs={12} md={4}>
                <TextField
                    id="searchField"
                    label="검색"
                    type="search"
                    variant="standard"
                    fullWidth
                    onChange={handleSearch}/>
            </Grid>
        </Grid>
        <InfiniteScroll
            dataLength={data.length} // 현재 표시된 아이템 수
            next={fetchMoreData} // 스크롤이 바닥에 닿을 때 호출되는 함수
            hasMore={!pageInfo.last} // 더 많은 아이템이 있는지 여부
            loader={<Typography></Typography>} // 로딩 중에 보여질 컴포넌트
        >
            <TableContainer component={Paper}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>No</TableCell>
                            {/*<TableCell>ID</TableCell>*/}
                            <TableCell>SERVICE_NAME</TableCell>
                            <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>MAPPER_TYPE</TableCell>
                            <TableCell>MAPPER_ID</TableCell>
                            <TableCell>MAPPER_NAME</TableCell>
                            <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>FILE_NAME</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (<TableRow
                            onClick={() => handleOpenModal(row)}
                            key={row.id}
                            sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                            <TableCell component="th" scope="row"
                                       sx={{display: {xs: 'none', sm: 'table-cell'}}}>
                                {index + 1}
                            </TableCell>
                            {/*<TableCell>{row.id}</TableCell>*/}
                            <TableCell>{row.serviceName}</TableCell>
                            <TableCell
                                sx={{display: {xs: 'none', sm: 'table-cell'}}}>{row.mapperType}</TableCell>
                            <TableCell>{row.mapperId}</TableCell>
                            <TableCell>{row.mapperName}</TableCell>
                            <TableCell sx={{display: {xs: 'none', sm: 'table-cell'}}}>{row.fileName}</TableCell>
                        </TableRow>))}
                    </TableBody>
                </Table>
            </TableContainer>
        </InfiniteScroll>
        <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '90%', // 90%로 크기 조절
                    maxHeight: '90vh', // 최대 높이를 화면 높이의 90%로 설정
                    overflowY: 'auto', // 내용이 모달보다 클 경우 스크롤 생성
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    p: 2,
                }}
            >

                {/* Tab 컴포넌트 */}
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    centered
                >
                    <Tab label="XML 상세 보기"/>
                    <Tab label="URL 리스트 보기"/>
                </Tabs>
                {/* Tab 내용 */}
                <TabPanel value={activeTab} index={0}>
                    <div style={{
                        display: 'flex',
                        justifyContent: "space-between",
                        textAlign: 'center',
                        marginTop: '20px'
                    }}>
                        {selectedRow ? <Typography id="mapperType" variant="h6" component="h2">
                            {selectedRow.mapperId}
                        </Typography> : <Typography/>
                        }
                        <Button variant="outlined" onClick={() => setIsModalOpen(false)}> 닫기 </Button>
                    </div>
                    <SyntaxHighlighter language="sql" style={a11yDark}>
                        {selectedRow && selectedRow.mapperBody}
                    </SyntaxHighlighter>
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {selectedRow ? (
                        <UrlListView servicesName={selectedRow.serviceName}
                                     mapperId={selectedRow.mapperId}
                                     defaultPageSize={10} setIsModalOpen={setIsModalOpen}/>// 모달시 페이징 안됨...
                    ) : (
                        <Typography variant="h6" component="h2">
                            선택된 항목이 없습니다.
                        </Typography>
                    )
                    }
                </TabPanel>
            </Box>
        </Modal>
    </Container>)
};

// TabPanel 컴포넌트를 정의하여 각 탭의 내용을 렌더링하는 함수
function TabPanel({children, value, index}) {
    return (
        <div hidden={value !== index} style={{padding: '20px'}}>
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

export default XmlListView;
