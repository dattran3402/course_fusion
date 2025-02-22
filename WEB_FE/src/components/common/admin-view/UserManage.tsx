import DynamicTable from "@atlaskit/dynamic-table";
import { useEffect, useState } from "react";
import TextField from "@atlaskit/textfield";
import Avatar from "@atlaskit/avatar";
import Select from "@atlaskit/select";
import SearchIcon from "@atlaskit/icon/glyph/search";
import Spinner from "@atlaskit/spinner";
import Toggle from "@atlaskit/toggle";
import Tooltip from "@atlaskit/tooltip";
import { Link } from "react-router-dom";

import UserApi from "@/api/userApi";
import { SelectOptionType } from "@/utils/types";
import { formatDateToYYYYMMDD, getFileUrl } from "@/utils/helper";
import { UserRole } from "@/utils/enum";

const searchModeOptions: SelectOptionType[] = [
  { label: "All users", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const sortCreatedDateOptions: SelectOptionType[] = [
  { label: "Newest First", value: "descending" },
  { label: "Oldest First", value: "ascending" },
];

const UserManage = () => {
  const [userList, setUserList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [searchMode, setSearchMode] = useState<SelectOptionType>(
    searchModeOptions[0]
  );
  const [sortCreatedDateOrder, setSortCreatedDateOrder] =
    useState<SelectOptionType>(sortCreatedDateOptions[0]);

  const fetchSearchResults = async () => {
    try {
      setIsSearching(true);

      const searchConditions: any = {
        query: searchValue,
      };

      if (searchMode.value !== "all") {
        if (searchMode.value === "active") {
          searchConditions.isBlocked = "false";
        } else {
          searchConditions.isBlocked = "true";
        }
      }

      const rawData = await UserApi.getAllUsers(searchConditions);

      if (rawData) {
        const order = sortCreatedDateOrder.value === "descending" ? -1 : 1;
        setUserList(
          rawData.data
            .filter((user) => user.role !== UserRole.ADMIN)
            .sort((a, b) => order * a.createdAt.localeCompare(b.createdAt))
        );
      }

      setIsSearching(false);
    } catch (err) {
      console.error("err", err);
      setUserList([]);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    let timerId;

    const delaySearch = () => {
      timerId = setTimeout(() => {
        fetchSearchResults();
      }, 300);
    };

    delaySearch();

    return () => {
      clearTimeout(timerId);
    };
  }, [searchValue, searchMode]);

  useEffect(() => {
    if (userList.length > 0) {
      const order = sortCreatedDateOrder.value === "descending" ? -1 : 1;
      setUserList((prev) =>
        prev.sort((a, b) => order * b.createdAt.localeCompare(a.createdAt))
      );
    }
  }, [userList, sortCreatedDateOrder]);

  const userListHead = {
    cells: [
      {
        key: "index",
        content: "",
        width: undefined,
      },
      {
        key: "name",
        content: "Name",
        isSortable: true,
        width: undefined,
      },
      {
        key: "email",
        content: "email",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "createdAt",
        content: "Created At",
        shouldTruncate: true,
        width: undefined,
      },
      {
        key: "status",
        content: "Status",
        shouldTruncate: true,
        width: undefined,
      },
    ],
  };

  const ToggleUser = async (user) => {
    try {
      await UserApi.updateUser({
        userId: user.id,
        isBlocked: !user.isBlocked,
      });
      fetchSearchResults();
    } catch (err) {
      console.error("Error", err);
    }
  };

  return (
    <div className="mt-4 flex w-full flex-col justify-center gap-6">
      <div className="flex">
        <div className="mt-4 flex w-full flex-row items-center gap-4">
          <div>
            <TextField
              elemBeforeInput={<SearchIcon size="small" label="" />}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSearchValue(e.target.value);
              }}
              placeholder="Search for users here"
            />
          </div>

          <div>
            <Select
              classNamePrefix="react-select"
              options={searchModeOptions}
              placeholder=""
              value={searchMode}
              onChange={(e) =>
                setSearchMode({
                  label: e?.label || "",
                  value: e?.value || "",
                })
              }
            />
          </div>

          <div>
            <Select
              classNamePrefix="react-select"
              options={sortCreatedDateOptions}
              placeholder=""
              value={sortCreatedDateOrder}
              onChange={(e) =>
                setSortCreatedDateOrder({
                  label: e?.label || "",
                  value: e?.value || "",
                })
              }
            />
          </div>
        </div>
      </div>

      <div>
        {isSearching ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <Spinner interactionName="load" size="large" />
          </div>
        ) : (
          <DynamicTable
            head={userListHead}
            rows={userList.map((user: any, index: number) => ({
              key: `row-${index}-${user.id}`,
              isHighlighted: false,
              cells: [
                {
                  key: "index",
                  content: index + 1,
                },
                {
                  key: "name",
                  content: (
                    <div className="flex items-center gap-4">
                      <Avatar src={getFileUrl(user.avatarFileId)} />
                      <Link to={"/profile/" + user.id}>{user.name}</Link>
                    </div>
                  ),
                },
                {
                  key: "email",
                  content: user.email,
                },
                {
                  key: "createdAt",
                  content: formatDateToYYYYMMDD(new Date(user.createdAt)),
                },
                {
                  key: "status",
                  content: (
                    <div className="flex w-[120px] flex-row items-center justify-between gap-4">
                      <div>{user.isBlocked ? "Inactive" : "Active"}</div>
                      <Tooltip
                        content={`${
                          user.isBlocked
                            ? "Unblock this user"
                            : "Block this user"
                        }`}
                      >
                        <Toggle
                          defaultChecked={!user.isBlocked}
                          onChange={() => ToggleUser(user)}
                        />
                      </Tooltip>
                    </div>
                  ),
                },
              ],
            }))}
            rowsPerPage={10}
            defaultPage={1}
            loadingSpinnerSize="large"
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default UserManage;
