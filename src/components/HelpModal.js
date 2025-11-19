import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Button,
  Divider,
} from '@mui/material';
import {
  Close,
  CloudUpload,
  VideoLibrary,
  Edit,
  Save,
  Download,
  AddCircle,
} from '@mui/icons-material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  maxWidth: 900,
  maxHeight: '90vh',
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 2,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
};

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
      {value === index && children}
    </div>
  );
}

export default function HelpModal({ open, onClose }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#1976d2', color: '#fff' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            📖 사용 가이드
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#fff' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<CloudUpload />} label="업로드" />
          <Tab icon={<VideoLibrary />} label="플레이어" />
          <Tab icon={<Edit />} label="하이라이트" />
          <Tab icon={<AddCircle />} label="커스텀 추가" />
          <Tab icon={<Save />} label="저장/내보내기" />
        </Tabs>

        {/* Tab 0: 업로드 */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            영상 업로드 방법
          </Typography>
          <Typography paragraph>
            <strong>방법 1: 드래그 앤 드롭</strong>
          </Typography>
          <ul>
            <li>업로드 영역에 영상 파일을 끌어다 놓기</li>
            <li>자동으로 업로드 및 분석 시작</li>
          </ul>
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>방법 2: 버튼 클릭</strong>
          </Typography>
          <ul>
            <li>'Upload Video' 또는 'Upload New Video' 버튼 클릭</li>
            <li>파일 탐색기에서 영상 선택</li>
          </ul>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            지원 형식
          </Typography>
          <Typography>• MP4, MKV (H.264 코덱 권장)</Typography>
          <Typography>• 파일 크기: 최대 10GB (권장 2GB 이하)</Typography>
          <Typography>• 영상 길이: 10분~120분 권장</Typography>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: '#fff3cd', borderRadius: 1 }}>
            <Typography variant="body2">
              ⚠️ <strong>지원하지 않는 형식 업로드 시:</strong> "MP4, MKV만 업로드 가능합니다." 메시지가 표시되고 업로드가 중단됩니다.
            </Typography>
          </Box>
        </TabPanel>

        {/* Tab 1: 플레이어 */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            비디오 플레이어 사용법
          </Typography>
          <Typography paragraph>
            <strong>재생 컨트롤:</strong>
          </Typography>
          <ul>
            <li><strong>▶/❚❚ 버튼:</strong> 재생/일시정지</li>
            <li><strong>⏮ 버튼:</strong> 10초 뒤로 이동</li>
            <li><strong>⏭ 버튼:</strong> 10초 앞으로 이동</li>
            <li><strong>타임라인 슬라이더:</strong> 원하는 시점으로 바로 이동</li>
            <li><strong>볼륨 슬라이더:</strong> 우측 슬라이더로 음량 조절 (0.0~1.0)</li>
          </ul>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography paragraph>
            <strong>키보드 단축키:</strong>
          </Typography>
          <ul>
            <li><strong>← (왼쪽 화살표):</strong> 10초 뒤로</li>
            <li><strong>→ (오른쪽 화살표):</strong> 10초 앞으로</li>
            <li><strong>Space:</strong> 재생/일시정지</li>
          </ul>
          
          <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
            <Typography variant="body2">
              💡 <strong>Tip:</strong> 하이라이트 목록에서 ▶ 버튼을 누르면 해당 구간으로 바로 이동하여 자동 재생됩니다!
            </Typography>
          </Box>
        </TabPanel>

        {/* Tab 2: 하이라이트 */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            하이라이트 선택 & 편집
          </Typography>
          
          <Typography paragraph>
            <strong>1. 하이라이트 목록 보기:</strong>
          </Typography>
          <ul>
            <li>우측 패널에 AI가 탐지한 하이라이트가 카테고리별로 표시됩니다</li>
            <li>상단 칩을 클릭하거나 탭을 변경하여 카테고리 필터링</li>
            <li>한 페이지에 4개씩 표시, &lt;/&gt; 버튼으로 페이지 이동</li>
          </ul>
          
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>2. 하이라이트 선택:</strong>
          </Typography>
          <ul>
            <li>체크박스(⭕/✅) 클릭으로 선택/해제</li>
            <li>선택된 항목은 타임라인에서 검은색으로 강조 표시</li>
            <li>내보내기 시 선택된 항목만 포함됨</li>
          </ul>
          
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>3. 하이라이트 삭제:</strong>
          </Typography>
          <ul>
            <li>🗑️ 버튼 클릭으로 목록에서 제거</li>
            <li>삭제 후 "저장되지 않음" 상태 표시</li>
            <li>'Save' 버튼으로 저장해야 영구 삭제됨</li>
          </ul>
          
          <Typography paragraph sx={{ mt: 2 }}>
            <strong>4. 색상 범례:</strong>
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#e53935', borderRadius: 0.5 }} />
              <Typography variant="body2">Goal</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#1976d2', borderRadius: 0.5 }} />
              <Typography variant="body2">Shoot</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#43a047', borderRadius: 0.5 }} />
              <Typography variant="body2">Save</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#8e24aa', borderRadius: 0.5 }} />
              <Typography variant="body2">Foul</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ff9800', borderRadius: 0.5 }} />
              <Typography variant="body2">Corner</Typography>
            </Box>
          </Box>
        </TabPanel>

        {/* Tab 3: 커스텀 추가 */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            커스텀 하이라이트 추가
          </Typography>
          <Typography paragraph>
            AI가 놓친 장면을 수동으로 추가할 수 있습니다.
          </Typography>
          
          <Typography paragraph>
            <strong>추가 방법:</strong>
          </Typography>
          <ol>
            <li>'Add Custom Highlight' 버튼 클릭</li>
            <li>모달 창에서 정보 입력:
              <ul>
                <li><strong>Highlight Name:</strong> 구간 이름 (예: "멋진 드리블")</li>
                <li><strong>Start Time:</strong> 시작 시간 (HH:MM:SS)
                  <br /><code>예: 00:15:30</code> (15분 30초)
                </li>
                <li><strong>End Time:</strong> 종료 시간 (HH:MM:SS)
                  <br /><code>예: 00:15:45</code> (15분 45초)
                </li>
              </ul>
            </li>
            <li>'Add' 버튼 클릭</li>
            <li>타임라인과 'Custom Highlights' 목록에 추가됨</li>
          </ol>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
            입력 규칙:
          </Typography>
          <ul>
            <li>시작 시간 &lt; 종료 시간</li>
            <li>종료 시간 ≤ 영상 전체 길이</li>
            <li>숫자만 입력 (HH:MM:SS 형식 엄수)</li>
          </ul>
          
        </TabPanel>

        {/* Tab 4: 저장/내보내기 */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            편집 저장 & 하이라이트 내보내기
          </Typography>
          
          <Typography paragraph>
            <strong>💾 편집 저장 (Save):</strong>
          </Typography>
          <ol>
            <li>하이라이트 선택/삭제/추가 등 변경사항이 있으면 "저장되지 않음" 칩 표시</li>
            <li>상단 'Save' 버튼 클릭</li>
            <li>"저장 중..." 메시지 표시</li>
            <li>DB와 파일시스템에 동시 저장</li>
            <li>"저장 완료!" 메시지 2초간 표시 후 상태 초기화</li>
          </ol>
          
          <Typography paragraph sx={{ mt: 3 }}>
            <strong>📥 하이라이트 내보내기 (Export):</strong>
          </Typography>
          <ol>
            <li>내보낼 하이라이트를 1개 이상 선택 (체크박스)</li>
            <li>편집 옵션 설정:
              <ul>
                <li><strong>Text Overlay:</strong> 이벤트 타입 텍스트 표시 여부</li>
                <li><strong>Fade Transition:</strong> 장면 전환 효과 여부</li>
              </ul>
            </li>
            <li>'Export Selected Highlights' 버튼 클릭</li>
            <li>"영상 편집 중입니다..." 메시지 표시 (처리 시간: 30초~5분)</li>
            <li>브라우저 다운로드 다이얼로그가 나타나면 저장 위치 선택</li>
            <li>파일명: <code>{`{원본명}_edited_highlights.mp4`}</code></li>
          </ol>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            편집 옵션 상세:
          </Typography>
          <Box sx={{ ml: 2, mt: 1 }}>
            <Typography paragraph>
              <strong>Text Overlay (ON):</strong>
            </Typography>
            <Typography sx={{ ml: 2, mb: 2 }}>
              각 하이라이트 하단에 이벤트 타입 표시 (예: "Goal", "Shoot", "Foul")
            </Typography>
            
            <Typography paragraph>
              <strong>Fade Transition (ON):</strong>
            </Typography>
            <Typography sx={{ ml: 2 }}>
              각 하이라이트 앞에 1.5초 검은 화면 + 중앙에 큰 이벤트 타입 텍스트 표시
            </Typography>
          </Box>
          

        </TabPanel>

        {/* Footer */}
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
          <Button variant="contained" onClick={onClose} sx={{ minWidth: 120 }}>
            닫기
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}

