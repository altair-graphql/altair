import { Sidebar } from 'flowbite-react';
import { HiWifi } from 'react-icons/hi';
import { NetworkSettings } from './NetworkSettings';

function App() {
  return (
    <div>
      <Sidebar
        aria-label="Default sidebar example"
        className="fixed top-0 left-0 z-40 h-screen"
      >
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item icon={HiWifi}>Network</Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      <NetworkSettings />
    </div>
  );
}

export default App;
