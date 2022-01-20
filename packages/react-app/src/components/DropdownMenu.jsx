import { Menu, Dropdown, Button, message } from 'antd';
import { CalculatorOutlined, DownOutlined, EditOutlined, BarsOutlined, TeamOutlined, FileOutlined, TrophyOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import { BrowserRouter, Link } from "react-router-dom";

export default function DropdownMenu(props) {
    // const [route, setRoute] = useState();
    //     useEffect(() => {
    //         setRoute(window.location.pathname);
    //     }, [setRoute]);

  function handleMenuClick(e) {
    switch(e.key) {
        case "1":
            //window.location.href = '/pledge';
            break;
        default:
            message.info('Default key '+e.key);
    }
}
    const menu = (
        <Menu onClick={handleMenuClick}>
          <Menu.Item key="1" icon={<EditOutlined />}>
          <Link
              onClick={() => {
                props.setRoute("/pledge");
              }}
              to="/pledge"
            >
              Koywe Pledge
          </Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<CalculatorOutlined />}>
            Emissions Calc
          </Menu.Item>
          <Menu.Item key="3" icon={<BarsOutlined />}>
            Ranking
          </Menu.Item>
          <Menu.Item key="4" icon={<TeamOutlined />}>
            Community
          </Menu.Item>
          <Menu.Item key="5" icon={<FileOutlined />}>
            Docs
          </Menu.Item>
          <Menu.Item key="6" icon={<TrophyOutlined />}>
            Mint Position NFT
          </Menu.Item>
        </Menu>
      );

    return (
        <Dropdown overlay={menu}>
            <Button>
                ··· <DownOutlined />
            </Button>
        </Dropdown>
    );
}