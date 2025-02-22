import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DropdownMenu, {
  DropdownItem,
  DropdownItemGroup,
} from "@atlaskit/dropdown-menu";
import { PrimaryDropdownButton } from "@atlaskit/atlassian-navigation";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "@/redux/hook";
import NotificationIcon from "@atlaskit/icon/glyph/notification";
import Button from "@atlaskit/button";
import styled from "styled-components";
import Heading from "@atlaskit/heading";
import Spinner from "@atlaskit/spinner";

import { socketInstance } from "@/App";
import NotificationApi from "@/api/notificationApi";
import { formatDate } from "@/utils/helper";

const NotificationIconStyled = styled.div`
  position: relative;

  .viewed-icon {
    position: absolute;
    background-color: #0065ff;
    width: 8px;
    height: 8px;
    border-radius: 999px;
  }
`;

const NotificationListStyled = styled.div`
  width: 600px;
  max-height: 500px;

  .item {
    height: 50px;
    display: flex;
    gap: 20px;
    align-items: center;
    border-bottom: 1px solid #ccc;
    width: 100%;
    justify-content: space-between;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
    }

    .dot.active {
      background-color: #0065ff;
    }

    .content {
      width: 440px;
      overflow: hidden;
      text-overflow: ellipsis;
      word-wrap: break-word;
      white-space: nowrap;
    }

    .time {
      width: 80px;
    }
  }

  .empty-flag {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 200px;
  }
`;

const NotificationDropdown = () => {
  const location = useLocation();

  const user = useAppSelector((state) => state.context.user);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationList, setNotificationList] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await NotificationApi.getNotification();
      const sortedList = res.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNotificationList(sortedList);
      setIsLoading(false);
    } catch (err) {
      setNotificationList([]);
      setIsLoading(false);
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  socketInstance.on("notification", () => {
    fetchData();
  });

  const handleViewNotification = async (notification) => {
    try {
      if (!notification.isViewed) {
        await NotificationApi.updateNotification({
          id: notification.id,
          isViewed: true,
        });
        socketInstance.emit("notification", {
          userIds: [user?.id],
        });
        fetchData();
      }
    } catch (err) {
      console.log("Error:", err);
      fetchData();
    }
  };

  return (
    <DropdownMenu
      trigger={({ triggerRef, ...props }) => (
        <NotificationIconStyled>
          {notificationList.find((notification) => !notification.isViewed) && (
            <div className="viewed-icon"></div>
          )}

          <Button
            iconBefore={<NotificationIcon label="" />}
            ref={triggerRef}
            appearance="subtle"
            {...props}
          ></Button>
        </NotificationIconStyled>
      )}
    >
      <DropdownItemGroup>
        <NotificationListStyled>
          {notificationList.map((notification) => (
            <DropdownItem key={notification.id}>
              <Link
                to={notification.link}
                onClick={() => handleViewNotification(notification)}
              >
                <div className="item">
                  <div
                    className={`dot ${!notification.isViewed && "active"}`}
                  ></div>
                  <div className="content">{notification.content}</div>
                  <div className="time">
                    {formatDate(notification.createdAt)}
                  </div>
                </div>
              </Link>
            </DropdownItem>
          ))}

          {isLoading ? (
            <div className="empty-flag">
              <Spinner />
            </div>
          ) : (
            <>
              {notificationList.length === 0 && (
                <div className="empty-flag">
                  <Heading level="h500">
                    You don't have any notification
                  </Heading>
                </div>
              )}
            </>
          )}
        </NotificationListStyled>
      </DropdownItemGroup>
    </DropdownMenu>
  );
};

export default NotificationDropdown;
